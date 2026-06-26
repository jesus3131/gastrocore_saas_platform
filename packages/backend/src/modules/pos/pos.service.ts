import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'
import { logger } from '../../config/logger.js'
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

    // Enrich tables with active order info
    for (const branch of branches) {
      for (const area of branch.areas) {
        for (const table of area.tables) {
          const activeOrder = await prisma.order.findFirst({
            where: { tenantId, tableId: table.id, status: { notIn: ['paid', 'canceled'] } },
            select: { id: true, total: true, status: true },
          })
          ;(table as any).activeOrder = activeOrder
        }
      }
    }

    return branches
  }

  async updateTableStatus(id: string, status: string) {
    return prisma.table.update({ where: { id }, data: { status } })
  }

  // ─── Orders ──────────────────────────────────────────────
  async getOrders(tenantId: string) {
    return prisma.order.findMany({
      where: { tenantId },
      include: { items: { include: { modifiers: true } }, table: true, customer: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async createOrder(tenantId: string, data: any, userId: string) {
    const order = await prisma.order.create({
      data: {
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
        items: {
          create: data.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            notes: item.notes,
            modifiers: {
              create: (item.modifiers || []).map((mod: any) => ({
                groupId: mod.groupId,
                optionId: mod.optionId,
                name: mod.name,
                price: mod.price,
              })),
            },
          })),
        },
      },
      include: { items: { include: { modifiers: true } }, table: true },
    })

    // Update table status if dine-in
    if (data.tableId) {
      await prisma.table.update({
        where: { id: data.tableId },
        data: { status: 'occupied' },
      })
    }

    // Deduct inventory if auto-inventory is enabled
    await this.deductInventory(tenantId, data.items)

    return order
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

    // Create split payments
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
    for (const item of items) {
      const recipe = await prisma.recipe.findFirst({
        where: { menuItemId: item.menuItemId },
        include: { ingredients: true },
      })

      if (!recipe) continue

      for (const ingredient of recipe.ingredients) {
        const qtyToDeduct = Number(ingredient.quantity) * item.quantity

        await prisma.ingredient.updateMany({
          where: { tenantId, id: ingredient.ingredientId },
          data: { currentStock: { decrement: qtyToDeduct } },
        })

        await prisma.stockMovement.create({
          data: {
            ingredientId: ingredient.ingredientId,
            type: 'out',
            quantity: qtyToDeduct,
            reference: `order-${item.menuItemId}`,
          },
        })

        // Check stock alert
        const updatedIngredient = await prisma.ingredient.findFirst({
          where: { tenantId, id: ingredient.ingredientId },
        })
        if (updatedIngredient && updatedIngredient.currentStock <= updatedIngredient.minimumStock) {
          // TODO: Trigger notification via notification service
          logger.warn({ ingredient: updatedIngredient.name, stock: updatedIngredient.currentStock, unit: updatedIngredient.unit }, 'Low stock alert')
        }
      }
    }
  }
}
