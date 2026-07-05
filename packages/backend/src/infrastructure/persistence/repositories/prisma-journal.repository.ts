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

  async findFirst(where: any, include?: any) {
    return getClient().journalEntry.findFirst({ where, ...(include ? { include } : {}) })
  }

  async create(data: any, include?: any) {
    return getClient().journalEntry.create({ data, ...(include ? { include } : {}) })
  }

  async update(id: string, data: any, include?: any) {
    return getClient().journalEntry.update({ where: { id }, data, ...(include ? { include } : {}) })
  }

  async delete(id: string) {
    return getClient().journalEntry.delete({ where: { id } })
  }

  async count(where: any) {
    return getClient().journalEntry.count({ where })
  }

  async findManyLines(where: any, opts?: any) {
    return getClient().journalLine.findMany({ where, ...opts })
  }

  async countLines(where: any) {
    return getClient().journalLine.count({ where })
  }
}
