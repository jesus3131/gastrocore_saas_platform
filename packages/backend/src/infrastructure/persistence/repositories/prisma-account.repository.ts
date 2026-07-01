import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { AccountRepository } from '../../../core/ports/repositories/account.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaAccountRepository implements AccountRepository {
  async findMany(tenantId: string, opts?: any) {
    return getClient().account.findMany({ where: { tenantId, ...opts?.where }, ...opts?.options })
  }

  async findFirst(where: any) {
    return getClient().account.findFirst({ where })
  }

  async create(data: any) {
    return getClient().account.create({ data })
  }

  async update(id: string, data: any) {
    return getClient().account.update({ where: { id }, data })
  }

  async delete(id: string) {
    return getClient().account.delete({ where: { id } })
  }
}
