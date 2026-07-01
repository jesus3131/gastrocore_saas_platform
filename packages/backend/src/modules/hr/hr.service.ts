import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'
import { ROLE_PERMISSIONS } from '@gastrocore/shared'
import { container } from '../../infrastructure/di/container.js'
import { CreateEmployeeUseCase } from '../../core/use-cases/hr/create-employee.use-case.js'

export class HrService {
  async getEmployees(tenantId: string) {
    return prisma.employee.findMany({
      where: { tenantId },
      include: { shifts: { orderBy: { date: 'desc' }, take: 5 } },
      orderBy: { name: 'asc' },
    })
  }

  async createEmployee(tenantId: string, data: any) {
    const useCase = container.resolve(CreateEmployeeUseCase)
    return useCase.execute({ tenantId, ...data })
  }

  async updateEmployee(tenantId: string, id: string, data: any) {
    const employee = await prisma.employee.findFirst({ where: { tenantId, id } })
    if (!employee) throw new AppError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found')
    return prisma.employee.update({ where: { id }, data })
  }

  async getShifts(tenantId: string) {
    return prisma.shift.findMany({
      where: { employee: { tenantId } },
      include: { employee: { select: { id: true, name: true, role: true } } },
      orderBy: { date: 'desc' },
      take: 50,
    })
  }

  async createShift(data: any) {
    return prisma.shift.create({
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

  async updateShiftStatus(id: string, status: any) {
    return prisma.shift.update({
      where: { id },
      data: { status },
      include: { employee: { select: { id: true, name: true } } },
    })
  }

  async getRoles() {
    return Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
      role,
      permissions,
    }))
  }

  async verifyPin(tenantId: string, pin: string, role?: string) {
    const employee = await prisma.employee.findFirst({
      where: { tenantId, pinCode: pin, isActive: true, ...(role ? { role: role as any } : {}) },
      select: { id: true, name: true, role: true },
    })
    if (!employee) throw new AppError(401, 'INVALID_PIN', 'PIN inválido')
    return employee
  }

  async getCommissions(tenantId: string) {
    return prisma.commission.findMany({
      where: { employee: { tenantId } },
      include: { employee: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }
}
