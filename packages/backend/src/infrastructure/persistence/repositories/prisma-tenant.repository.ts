import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { TenantRepository } from '../../../core/ports/repositories/tenant.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaTenantRepository implements TenantRepository {
  async findById(id: string) {
    return getClient().tenant.findUnique({ where: { id } })
  }

  async update(id: string, data: any) {
    return getClient().tenant.update({ where: { id }, data })
  }

  async getFeatureFlags(tenantId: string) {
    return getClient().tenantFeatureFlag.findMany({ where: { tenantId } })
  }

  async upsertFeatureFlag(tenantId: string, feature: string, enabled: boolean) {
    await getClient().tenantFeatureFlag.upsert({
      where: { tenantId_feature: { tenantId, feature } },
      update: { enabled },
      create: { tenantId, feature, enabled },
    })
  }

  async findUsersByTenant(tenantId: string, opts?: { role?: string; isActive?: boolean }) {
    return getClient().user.findMany({ where: { tenantId, ...opts } })
  }
}
