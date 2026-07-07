import { prisma } from '../../../config/database/prisma.js'
import type { TableRepository } from '../../../core/ports/repositories/table.repository.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaTableRepository implements TableRepository {
  async updateStatus(tenantId: string, id: string, status: string): Promise<any> {
    const client = getClient()
    return client.table.update({ where: { id, branch: { tenantId } }, data: { status } })
  }

  async findById(tenantId: string, id: string): Promise<any> {
    const client = getClient()
    return client.table.findFirst({ where: { id, branch: { tenantId } } })
  }

  async findBranchByTable(tableId: string): Promise<any> {
    const client = getClient()
    const table = await client.table.findUnique({ where: { id: tableId }, select: { branchId: true } })
    if (!table?.branchId) return null
    return client.branch.findUnique({ where: { id: table.branchId }, select: { id: true, tenantId: true } })
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

  async assignWaiter(tenantId: string, id: string, waiterId: string, waiterName: string): Promise<any> {
    const client = getClient()
    return client.table.update({ where: { id, branch: { tenantId } }, data: { waiterId, waiterName } })
  }

  async clearWaiter(tenantId: string, id: string): Promise<any> {
    const client = getClient()
    return client.table.update({ where: { id, branch: { tenantId } }, data: { waiterId: null, waiterName: null } })
  }
}
