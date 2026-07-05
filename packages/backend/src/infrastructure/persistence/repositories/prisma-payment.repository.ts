import { prisma } from '../../../config/database/prisma.js'
import type { PaymentRepository } from '../../../core/ports/repositories/payment.repository.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaPaymentRepository implements PaymentRepository {
  async create(data: {
    tenantId?: string
    orderId: string
    method: string
    amount: number
    reference?: string
    status?: string
    metadata?: any
  }): Promise<any> {
    const client = getClient()
    return client.payment.create({ data })
  }

  async createMany(data: Array<{
    tenantId?: string
    orderId: string
    method: string
    amount: number
    reference?: string
    status?: string
    metadata?: any
  }>): Promise<any> {
    const client = getClient()
    return Promise.all(data.map((d) => client.payment.create({ data: d })))
  }

  async updateByOrder(orderId: string, data: { status: string; reference?: string }): Promise<any> {
    const client = getClient()
    const payment = await client.payment.findFirst({ where: { orderId }, orderBy: { createdAt: 'desc' } })
    if (!payment) throw new Error(`No payment found for order ${orderId}`)
    return client.payment.update({ where: { id: payment.id }, data })
  }
}
