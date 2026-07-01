import { prisma } from '../../../config/database/prisma.js'
import type { PaymentRepository } from '../../../core/ports/repositories/payment.repository.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaPaymentRepository implements PaymentRepository {
  async create(data: {
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
}
