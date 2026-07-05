import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { SubscriptionRepository } from '../../../core/ports/repositories/subscription.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  async findFirst(where: any, include?: any) {
    return getClient().subscription.findFirst({ where, orderBy: { createdAt: 'desc' }, ...(include ? { include } : {}) })
  }

  async create(data: any) {
    return getClient().subscription.create({ data })
  }

  async createInvoice(data: any) {
    return getClient().subscriptionInvoice.create({ data })
  }

  async findInvoices(tenantId: string, opts?: any) {
    return getClient().subscriptionInvoice.findMany({
      where: { subscription: { tenantId } },
      orderBy: { createdAt: 'desc' },
      ...opts,
    })
  }
}
