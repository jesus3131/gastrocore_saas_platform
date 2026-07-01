import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { TenantRepository } from '../../../core/ports/repositories/tenant.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaTenantRepository implements TenantRepository {
  async findById(id: string, select?: any) {
    return getClient().tenant.findUnique({ where: { id }, ...(select ? { select } : {}) })
  }

  async update(id: string, data: any) {
    return getClient().tenant.update({ where: { id }, data })
  }

  async create(data: any) {
    return getClient().tenant.create({ data })
  }

  async getFeatureFlags(tenantId: string, opts?: { enabled?: boolean }) {
    const where: any = { tenantId }
    if (opts?.enabled !== undefined) where.enabled = opts.enabled
    return getClient().tenantFeatureFlag.findMany({ where, ...(opts?.enabled ? { select: { feature: true } } : {}) })
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

  async findManyTenants(options?: any) {
    return getClient().tenant.findMany({ ...options })
  }

  async createBranch(data: any) {
    return getClient().branch.create({ data })
  }

  async createServiceArea(data: any) {
    return getClient().serviceArea.create({ data })
  }

  async createTable(data: any) {
    return getClient().table.create({ data })
  }

  async deleteFeatureFlags(where: any) {
    await getClient().tenantFeatureFlag.deleteMany({ where })
  }

  async findManyAdmins(tenantId: string) {
    return getClient().user.findMany({
      where: { tenantId, role: 'admin', isActive: true },
      select: { email: true, name: true },
    })
  }

  async updateAdminPassword(userId: string, passwordHash: string) {
    await getClient().user.update({ where: { id: userId }, data: { passwordHash } })
  }
}
