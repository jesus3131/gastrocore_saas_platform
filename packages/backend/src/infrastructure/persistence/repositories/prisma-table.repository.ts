import { prisma } from '../../../config/database/prisma.js'
import type { TableRepository } from '../../../core/ports/repositories/table.repository.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaTableRepository implements TableRepository {
  async updateStatus(id: string, status: string): Promise<any> {
    const client = getClient()
    return client.table.update({ where: { id }, data: { status } })
  }

  async findById(id: string): Promise<any> {
    const client = getClient()
    return client.table.findUnique({ where: { id } })
  }

  async findAllWithBranches(tenantId: string): Promise<any[]> {
    const client = getClient()
    return client.branch.findMany({
      where: { tenantId, isActive: true },
      include: {
        areas: {
          include: { tables: { orderBy: { label: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  }
}
