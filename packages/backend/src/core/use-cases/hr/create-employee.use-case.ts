import { injectable, inject } from 'tsyringe'
import { SUBSCRIPTION_PLANS } from '@gastrocore/shared'
import type { EmployeeRepository } from '../../ports/repositories/employee.repository.js'
import type { TenantRepository } from '../../ports/repositories/tenant.repository.js'
import { AppError } from '../../../common/filters/error-handler.js'
import { TenantId } from '../../domain/value-objects/tenant-id.js'

export interface CreateEmployeeInput {
  tenantId: string
  name: string
  email: string
  phone?: string
  role: string
  pinCode?: string
  hourlyRate?: number
  commissionPct?: number
}

@injectable()
export class CreateEmployeeUseCase {
  constructor(
    @inject('EmployeeRepository') private readonly employeeRepo: EmployeeRepository,
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
  ) {}

  async execute(input: CreateEmployeeInput) {
    TenantId.fromString(input.tenantId)

    const tenant = await this.tenantRepo.findById(input.tenantId)
    if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant not found')

    const plan = SUBSCRIPTION_PLANS[tenant.subscriptionPlan as keyof typeof SUBSCRIPTION_PLANS]
    const extraUsers = (tenant.customFields as any)?.extraUsers || 0
    const maxAllowed = plan.maxUsers + extraUsers

    const currentCount = await this.employeeRepo.countActive(input.tenantId)
    if (currentCount >= maxAllowed) {
      throw new AppError(403, 'USER_LIMIT_REACHED', `Límite de usuarios alcanzado (${maxAllowed}). Contacta al super admin para aumentar el cupo.`)
    }

    return this.employeeRepo.create(input.tenantId, {
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      pinCode: input.pinCode,
      hourlyRate: input.hourlyRate,
      commissionPct: input.commissionPct,
    })
  }
}
