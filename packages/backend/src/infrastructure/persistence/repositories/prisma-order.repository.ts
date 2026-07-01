import { prisma } from '../../../config/database/prisma.js'
import type { CreateOrderData, OrderRepository } from '../../../core/ports/repositories/order.repository.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaOrderRepository implements OrderRepository {
  async create(data: CreateOrderData): Promise<any> {
    const client = getClient()
    return client.order.create({
      data: {
        tenantId: data.tenantId,
        branchId: data.branchId,
        tableId: data.tableId,
        userId: data.userId,
        customerId: data.customerId,
        type: data.type,
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount,
        total: data.total,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            notes: item.notes,
            modifiers: item.modifiers?.length
              ? { create: item.modifiers.map((mod) => ({ groupId: mod.groupId, optionId: mod.optionId, name: mod.name, price: mod.price })) }
              : undefined,
          })),
        },
      },
      include: { items: { include: { modifiers: true } }, table: true },
    })
  }

  async findById(tenantId: string, id: string): Promise<any> {
    const client = getClient()
    return client.order.findFirst({
      where: { tenantId, id },
      include: { items: { include: { modifiers: true } }, table: true, customer: true },
    })
  }

  async findActiveByTable(tenantId: string, tableId: string): Promise<any> {
    const client = getClient()
    return client.order.findFirst({
      where: { tenantId, tableId, status: { notIn: ['paid', 'canceled'] } },
      select: { id: true, total: true, status: true },
    })
  }

  async findMany(tenantId: string, query?: { status?: string; limit?: number; offset?: number }): Promise<any[]> {
    const client = getClient()
    const where: any = { tenantId }
    if (query?.status) where.status = query.status
    return client.order.findMany({
      where,
      include: { items: { include: { modifiers: true } }, table: true, customer: true },
      orderBy: { createdAt: 'desc' },
      take: query?.limit || 50,
      skip: query?.offset || 0,
    })
  }

  async findActiveByTables(tableIds: string[]): Promise<any[]> {
    const client = getClient()
    const orders = await client.order.findMany({
      where: { tableId: { in: tableIds }, status: { notIn: ['paid', 'canceled'] } },
      select: { id: true, total: true, status: true, tableId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    const seen = new Set<string>()
    const result: any[] = []
    for (const o of orders) {
      if (o.tableId && !seen.has(o.tableId)) {
        seen.add(o.tableId)
        result.push({ tableId: o.tableId, id: o.id, total: Number(o.total), status: o.status })
      }
    }
    return result
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const client = getClient()
    return client.order.update({ where: { id }, data: { status } })
  }

  async updatePaymentMethod(id: string, method: string): Promise<any> {
    const client = getClient()
    return client.order.update({ where: { id }, data: { paymentMethod: method } })
  }
}
