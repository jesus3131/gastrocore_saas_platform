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

  async updateStatus(id: string, status: string): Promise<any> {
    const client = getClient()
    return client.order.update({ where: { id }, data: { status } })
  }
}
