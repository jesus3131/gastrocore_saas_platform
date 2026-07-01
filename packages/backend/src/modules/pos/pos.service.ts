import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'
import { logger } from '../../config/logger.js'
import { container } from '../../infrastructure/di/container.js'
import { CreateOrderUseCase } from '../../core/use-cases/pos/create-order.use-case.js'
import type { OrderStatus, PaymentMethod } from '@prisma/client'

export class PosService {
  // ─── Menu ────────────────────────────────────────────────
  async getMenu(tenantId: string) {
    return prisma.menuCategory.findMany({
      where: { tenantId, isActive: true },
      include: {
        menuItems: { where: { available: true }, orderBy: { sortOrder: 'asc' } },
        modifiers: { include: { options: { orderBy: { sortOrder: 'asc' } } } },
      },
      orderBy: { sortOrder: 'asc' },
    })
  }

  async getMenuItems(tenantId: string, categoryId: string) {
    return prisma.menuItem.findMany({
      where: { tenantId, categoryId, available: true },
      orderBy: { sortOrder: 'asc' },
    })
  }

  // ─── Tables ──────────────────────────────────────────────
  async getTables(tenantId: string) {
    const branches = await prisma.branch.findMany({
      where: { tenantId, isActive: true },
      include: {
        areas: {
          include: { tables: { orderBy: { label: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    const tableIds = branches.flatMap((b) => b.areas.flatMap((a) => a.tables.map((t) => t.id)))

    let activeOrders: { tableId: string; id: string; total: number; status: string }[] = []
    if (tableIds.length > 0) {
      const orders = await prisma.order.findMany({
        where: { tableId: { in: tableIds }, status: { notIn: ['paid', 'canceled'] } },
        select: { id: true, total: true, status: true, tableId: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      })
      // Deduplicate: keep the most recent order per table
      const seen = new Set<string>()
      for (const o of orders) {
        if (o.tableId && !seen.has(o.tableId)) {
          seen.add(o.tableId)
          activeOrders.push({ tableId: o.tableId, id: o.id, total: Number(o.total), status: o.status })
        }
      }
    }

    const orderMap = new Map(activeOrders.map((o) => [o.tableId, { id: o.id, total: o.total, status: o.status }]))

    for (const branch of branches) {
      for (const area of branch.areas) {
        for (const table of area.tables) {
          ;(table as any).activeOrder = orderMap.get(table.id) || null
        }
      }
    }

    return branches
  }

  async updateTableStatus(id: string, status: string) {
    return prisma.table.update({ where: { id }, data: { status } })
  }

  // ─── Orders ──────────────────────────────────────────────
  async getOrders(tenantId: string, query?: { status?: string; limit?: number; offset?: number }) {
    const where: any = { tenantId }
    if (query?.status) where.status = query.status

    return prisma.order.findMany({
      where,
      include: { items: { include: { modifiers: true } }, table: true, customer: true },
      orderBy: { createdAt: 'desc' },
      take: query?.limit || 50,
      skip: query?.offset || 0,
    })
  }

  async createOrder(tenantId: string, data: any, userId: string) {
    const useCase = container.resolve(CreateOrderUseCase)
    return useCase.execute({
      tenantId,
      branchId: data.branchId,
      tableId: data.tableId,
      userId,
      customerId: data.customerId,
      type: data.type || 'dine_in',
      subtotal: data.subtotal,
      tax: data.tax || 0,
      discount: data.discount || 0,
      total: data.total,
      notes: data.notes,
      items: data.items,
    })
  }

  async getOrder(tenantId: string, id: string) {
    const order = await prisma.order.findFirst({
      where: { tenantId, id },
      include: { items: { include: { modifiers: true } }, table: true, customer: true },
    })
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')
    return order
  }

  async updateOrderStatus(tenantId: string, id: string, status: OrderStatus) {
    const order = await prisma.order.findFirst({ where: { tenantId, id } })
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')
    return prisma.order.update({
      where: { id },
      data: { status },
    })
  }

  // ─── Payments ────────────────────────────────────────────
  async processPayment(tenantId: string, data: { orderId: string; method: PaymentMethod; amount: number; reference?: string }) {
    const order = await prisma.order.findFirst({ where: { tenantId, id: data.orderId } })
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')

    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        method: data.method,
        amount: data.amount,
        reference: data.reference,
        status: 'completed',
      },
    })

    // Update order status and payment method
    await prisma.order.update({
      where: { id: data.orderId },
      data: { status: 'paid', paymentMethod: data.method },
    })

    // Free the table
    if (order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'available' },
      })
    }

    return payment
  }

  async splitBill(tenantId: string, data: { orderId: string; splits: { items: string[]; amount: number }[] }) {
    const order = await prisma.order.findFirst({
      where: { tenantId, id: data.orderId },
      include: { items: true },
    })
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')

    const payments = await Promise.all(
      data.splits.map((split) =>
        prisma.payment.create({
          data: {
            orderId: data.orderId,
            method: 'cash',
            amount: split.amount,
            status: 'completed',
            metadata: { splitItems: split.items },
          },
        })
      )
    )

    return payments
  }

  // ─── Inventory Deduction ────────────────────────────────
  private async deductInventory(tenantId: string, items: any[]) {
    const menuItemIds = [...new Set(items.map((i: any) => i.menuItemId))]
    const recipes = await prisma.recipe.findMany({
      where: { menuItemId: { in: menuItemIds } },
      include: { ingredients: true },
    })

    const recipeMap = new Map(recipes.map((r) => [r.menuItemId, r]))
    const deductions: { ingredientId: string; qty: number; ref: string }[] = []

    for (const item of items) {
      const recipe = recipeMap.get(item.menuItemId)
      if (!recipe) continue
      for (const ing of recipe.ingredients) {
        deductions.push({ ingredientId: ing.ingredientId, qty: Number(ing.quantity) * item.quantity, ref: `order-${item.menuItemId}` })
      }
    }

    if (deductions.length === 0) return

    // Batch update ingredient stocks
    for (const d of deductions) {
      await prisma.ingredient.updateMany({
        where: { tenantId, id: d.ingredientId },
        data: { currentStock: { decrement: d.qty } },
      })
    }

    // Single batch create for stock movements
    await prisma.stockMovement.createMany({
      data: deductions.map((d) => ({ ingredientId: d.ingredientId, type: 'out', quantity: d.qty, reference: d.ref })),
    })

    // Single query for stock alerts
    const ingredientIds = [...new Set(deductions.map((d) => d.ingredientId))]
    const lowStock = await prisma.ingredient.findMany({
      where: { tenantId, id: { in: ingredientIds }, currentStock: { lte: prisma.ingredient.fields.minimumStock } },
      select: { name: true, currentStock: true, unit: true },
    })
    for (const ing of lowStock) {
      logger.warn({ ingredient: ing.name, stock: ing.currentStock, unit: ing.unit }, 'Low stock alert')
    }
  }
}
