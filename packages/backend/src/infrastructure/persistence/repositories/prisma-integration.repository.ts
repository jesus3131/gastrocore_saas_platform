import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { IntegrationRepository } from '../../../core/ports/repositories/integration.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaIntegrationRepository implements IntegrationRepository {
  async findMany(tenantId: string, type?: string) {
    return getClient().integration.findMany({
      where: { tenantId, ...(type ? { type } : {}) },
      orderBy: { provider: 'asc' },
    })
  }

  async findFirst(where: any) {
    return getClient().integration.findFirst({ where })
  }

  async findUnique(where: any) {
    return getClient().integration.findUnique({ where })
  }

  async create(data: any) {
    return getClient().integration.create({ data })
  }

  async update(id: string, data: any) {
    return getClient().integration.update({ where: { id }, data })
  }

  async delete(id: string) {
    return getClient().integration.delete({ where: { id } })
  }
}
