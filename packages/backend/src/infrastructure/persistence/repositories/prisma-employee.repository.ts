import { prisma } from '../../../config/database/prisma.js'
import type { EmployeeRepository } from '../../../core/ports/repositories/employee.repository.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaEmployeeRepository implements EmployeeRepository {
  async create(tenantId: string, data: any): Promise<any> {
    return prisma.employee.create({ data: { ...data, tenantId } })
  }

  async findById(tenantId: string, id: string): Promise<any> {
    return prisma.employee.findFirst({ where: { tenantId, id } })
  }

  async findMany(tenantId: string, opts?: { limit?: number; offset?: number }): Promise<any[]> {
    return prisma.employee.findMany({
      where: { tenantId },
      include: { shifts: { orderBy: { date: 'desc' }, take: 5 } },
      orderBy: { name: 'asc' },
      take: opts?.limit,
      skip: opts?.offset,
    })
  }

  async update(tenantId: string, id: string, data: any): Promise<any> {
    const employee = await prisma.employee.findFirst({ where: { id, tenantId } })
    if (!employee) {
      throw new Error('Employee not found or tenant mismatch')
    }
    return prisma.employee.update({ where: { id }, data })
  }

  async countActive(tenantId: string): Promise<number> {
    return prisma.employee.count({ where: { tenantId, isActive: true } })
  }

  async findManyShifts(tenantId: string, opts?: { limit?: number; offset?: number }): Promise<any[]> {
    const client = getClient()
    return client.shift.findMany({
      where: { employee: { tenantId } },
      include: { employee: { select: { id: true, name: true, role: true } } },
      orderBy: { date: 'desc' },
      take: opts?.limit ?? 50,
      skip: opts?.offset,
    })
  }

  async createShift(data: any): Promise<any> {
    const client = getClient()
    return client.shift.create({
      data: {
        employeeId: data.employeeId,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        notes: data.notes,
      },
      include: { employee: { select: { id: true, name: true } } },
    })
  }

  async updateShift(id: string, data: any): Promise<any> {
    const client = getClient()
    return client.shift.update({
      where: { id },
      data: { status: data.status },
      include: { employee: { select: { id: true, name: true } } },
    })
  }

  async findManyCommissions(tenantId: string, opts?: { limit?: number; offset?: number }): Promise<any[]> {
    const client = getClient()
    return client.commission.findMany({
      where: { employee: { tenantId } },
      include: { employee: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: opts?.limit ?? 50,
      skip: opts?.offset,
    })
  }

  async findByPin(tenantId: string, pin: string, role?: string): Promise<any | null> {
    const client = getClient()
    return client.employee.findFirst({
      where: { tenantId, pinCode: pin, isActive: true, ...(role ? { role } : {}) },
      select: { id: true, name: true, role: true },
    })
  }
}
