import { prisma } from '../../../config/database/prisma.js'
import type { EmployeeRepository } from '../../../core/ports/repositories/employee.repository.js'

export class PrismaEmployeeRepository implements EmployeeRepository {
  async create(tenantId: string, data: any): Promise<any> {
    return prisma.employee.create({ data: { ...data, tenantId } })
  }

  async findById(tenantId: string, id: string): Promise<any> {
    return prisma.employee.findFirst({ where: { tenantId, id } })
  }

  async findMany(tenantId: string): Promise<any[]> {
    return prisma.employee.findMany({
      where: { tenantId },
      include: { shifts: { orderBy: { date: 'desc' }, take: 5 } },
      orderBy: { name: 'asc' },
    })
  }

  async update(tenantId: string, id: string, data: any): Promise<any> {
    return prisma.employee.update({ where: { id }, data })
  }

  async countActive(tenantId: string): Promise<number> {
    return prisma.employee.count({ where: { tenantId, isActive: true } })
  }
}
