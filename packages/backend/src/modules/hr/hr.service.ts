import jwt from 'jsonwebtoken'
import { inject, injectable } from 'tsyringe'
import { AppError } from '../../common/filters/error-handler.js'
import { ROLE_PERMISSIONS } from '@gastrocore/shared'
import { env } from '../../config/env.js'
import { container } from '../../infrastructure/di/container.js'
import { CreateEmployeeUseCase } from '../../core/use-cases/hr/create-employee.use-case.js'
import type { EmployeeRepository } from '../../core/ports/repositories/employee.repository.js'
import type { JwtPayload } from '@gastrocore/shared'

@injectable()
export class HrService {
  constructor(
    @inject('EmployeeRepository') private readonly employeeRepo: EmployeeRepository,
  ) {}

  async getEmployees(tenantId: string, opts?: { limit?: number; offset?: number }) {
    return this.employeeRepo.findMany(tenantId, opts)
  }

  async createEmployee(tenantId: string, data: any) {
    const useCase = container.resolve(CreateEmployeeUseCase)
    return useCase.execute({ tenantId, ...data })
  }

  async updateEmployee(tenantId: string, id: string, data: any) {
    const employee = await this.employeeRepo.findById(tenantId, id)
    if (!employee) throw new AppError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found')
    return this.employeeRepo.update(tenantId, id, data)
  }

  async getShifts(tenantId: string, opts?: { limit?: number; offset?: number }) {
    return this.employeeRepo.findManyShifts(tenantId, opts)
  }

  async createShift(tenantId: string, data: any) {
    return this.employeeRepo.createShift({ ...data, tenantId })
  }

  async updateShiftStatus(tenantId: string, id: string, status: any) {
    return this.employeeRepo.updateShift(id, { status })
  }

  async getRoles() {
    return Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
      role,
      permissions,
    }))
  }

  /**
   * Nivel 3 - POS PIN authentication.
   * Returns scoped JWT with authMethod='pin' for POS operations.
   */
  async verifyPin(tenantId: string, pin: string, role?: string) {
    const employee = await this.employeeRepo.findByPin(tenantId, pin, role)
    if (!employee) throw new AppError(401, 'INVALID_PIN', 'PIN inválido')

    const token = jwt.sign({
      sub: employee.id,
      tenantId,
      role: employee.role as JwtPayload['role'],
      email: employee.email,
      authMethod: 'pin',
    } satisfies JwtPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRATION,
    } as jwt.SignOptions)

    return { employee, token }
  }

  async getCommissions(tenantId: string, opts?: { limit?: number; offset?: number }) {
    return this.employeeRepo.findManyCommissions(tenantId, opts)
  }
}
