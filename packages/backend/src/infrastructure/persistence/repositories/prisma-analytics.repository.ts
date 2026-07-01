import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { AnalyticsRepository } from '../../../core/ports/repositories/analytics.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaAnalyticsRepository implements AnalyticsRepository {
  async findOrders(tenantId: string, where?: any, options?: any) {
    return getClient().order.findMany({ where: { tenantId, ...where }, ...options })
  }

  async findMenuItems(tenantId: string, options?: any) {
    return getClient().menuItem.findMany({ where: { tenantId }, ...options })
  }

  async findBranches(tenantId: string) {
    return getClient().branch.findMany({ where: { tenantId, isActive: true } })
  }

  async aggregateOrder(tenantId: string, where: any, aggregate: any) {
    return getClient().order.aggregate({ where: { tenantId, ...where }, ...aggregate })
  }
}
