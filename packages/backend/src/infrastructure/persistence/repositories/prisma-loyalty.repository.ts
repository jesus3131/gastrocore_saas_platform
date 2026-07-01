import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { LoyaltyRepository } from '../../../core/ports/repositories/loyalty.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaLoyaltyRepository implements LoyaltyRepository {
  async findProgram(tenantId: string) {
    return getClient().loyaltyProgram.findFirst({ where: { tenantId } })
  }

  async createProgram(data: any) {
    return getClient().loyaltyProgram.create({ data })
  }

  async createRedemption(data: any) {
    return getClient().loyaltyRedemption.create({ data })
  }

  async findRedemptions(customerId: string) {
    return getClient().loyaltyRedemption.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
