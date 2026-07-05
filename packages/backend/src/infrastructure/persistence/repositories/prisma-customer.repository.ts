import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { CustomerRepository } from '../../../core/ports/repositories/customer.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaCustomerRepository implements CustomerRepository {
  async findMany(tenantId: string, opts?: any) {
    return getClient().customer.findMany({ where: { tenantId, ...opts?.where }, ...opts?.options })
  }

  async findFirst(where: any, include?: any) {
    return getClient().customer.findFirst({ where, include })
  }

  async create(data: any) {
    return getClient().customer.create({ data })
  }

  async update(id: string, data: any) {
    return getClient().customer.update({ where: { id }, data })
  }

  async count(where: any) {
    return getClient().customer.count({ where })
  }

  async groupBy(tenantId: string, field: string) {
    return getClient().customer.groupBy({ by: [field as any], where: { tenantId }, _count: { id: true } })
  }
}
