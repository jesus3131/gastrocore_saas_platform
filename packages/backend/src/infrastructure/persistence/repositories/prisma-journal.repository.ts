import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { JournalRepository } from '../../../core/ports/repositories/journal.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaJournalRepository implements JournalRepository {
  async findMany(tenantId: string, opts?: any) {
    const [entries, total] = await Promise.all([
      getClient().journalEntry.findMany({ where: { tenantId, ...opts?.where }, ...opts?.options }),
      getClient().journalEntry.count({ where: { tenantId, ...opts?.where } }),
    ])
    return { entries, total }
  }

  async findFirst(where: any) {
    return getClient().journalEntry.findFirst({ where })
  }

  async create(data: any) {
    return getClient().journalEntry.create({ data })
  }

  async update(id: string, data: any) {
    return getClient().journalEntry.update({ where: { id }, data })
  }

  async delete(id: string) {
    return getClient().journalEntry.delete({ where: { id } })
  }

  async count(where: any) {
    return getClient().journalEntry.count({ where })
  }
}
