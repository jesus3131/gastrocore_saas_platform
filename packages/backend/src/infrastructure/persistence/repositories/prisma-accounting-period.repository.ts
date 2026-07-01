import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { AccountingPeriodRepository } from '../../../core/ports/repositories/accounting-period.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaAccountingPeriodRepository implements AccountingPeriodRepository {
  async findMany(tenantId: string) {
    return getClient().accountingPeriod.findMany({ where: { tenantId }, orderBy: { startDate: 'desc' } })
  }

  async findFirst(where: any) {
    return getClient().accountingPeriod.findFirst({ where })
  }

  async create(data: any) {
    return getClient().accountingPeriod.create({ data })
  }

  async update(id: string, data: any) {
    return getClient().accountingPeriod.update({ where: { id }, data })
  }
}
