import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { UserRepository } from '../../../core/ports/repositories/user.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string) {
    return getClient().user.findFirst({ where: { email } })
  }

  async findById(id: string) {
    return getClient().user.findUnique({ where: { id } })
  }

  async create(data: any) {
    return getClient().user.create({ data })
  }

  async update(id: string, data: any) {
    return getClient().user.update({ where: { id }, data })
  }

  async findFirst(where: any) {
    return getClient().user.findFirst({ where })
  }
}
