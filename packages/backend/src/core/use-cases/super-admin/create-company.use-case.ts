import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { injectable, inject } from 'tsyringe'
import type { UserRepository } from '../../ports/repositories/user.repository.js'
import type { TenantRepository } from '../../ports/repositories/tenant.repository.js'
import type { EmployeeRepository } from '../../ports/repositories/employee.repository.js'
import type { SubscriptionRepository } from '../../ports/repositories/subscription.repository.js'
import type { UnitOfWork } from '../../ports/unit-of-work.js'

@injectable()
export class CreateCompanyUseCase {
  private readonly saltRounds = 12

  constructor(
    @inject('UserRepository') private readonly userRepo: UserRepository,
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
    @inject('EmployeeRepository') private readonly employeeRepo: EmployeeRepository,
    @inject('SubscriptionRepository') private readonly subscriptionRepo: SubscriptionRepository,
    @inject('UnitOfWork') private readonly uow: UnitOfWork,
  ) {}

  async execute(data: {
    companyName: string
    adminName: string
    adminEmail: string
    businessType: string
    planId: string
    taxId?: string
    address?: string
    phone?: string
  }) {
    const { AppError } = await import('../../../common/filters/error-handler.js')
    const { SUBSCRIPTION_PLANS } = await import('@gastrocore/shared')

    const existing = await this.userRepo.findByEmail(data.adminEmail)
    if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered')

    const rawPassword = this.generatePassword()
    const passwordHash = await bcrypt.hash(rawPassword, this.saltRounds)

    const planId = (data.planId || 'basic') as keyof typeof SUBSCRIPTION_PLANS
    const plan = SUBSCRIPTION_PLANS[planId]

    const customFields: Record<string, unknown> = {}
    if (data.taxId) customFields.taxId = data.taxId
    if (data.address) customFields.address = data.address
    if (data.phone) customFields.phone = data.phone

    return this.uow.execute(async () => {
      const tenant = await this.tenantRepo.create({
        name: data.companyName,
        slug: data.companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        businessType: data.businessType as never,
        subscriptionPlan: planId,
        subscriptionStatus: 'trial',
        customFields: customFields as any,
      })

      const employee = await this.employeeRepo.create(tenant.id, {
        name: data.adminName,
        email: data.adminEmail,
        role: 'admin',
      })

      const user = await this.userRepo.create({
        tenantId: tenant.id,
        employeeId: employee.id,
        email: data.adminEmail,
        passwordHash,
        name: data.adminName,
        tenantRole: 'admin',
      })

      if (plan) {
        const subscription = await this.subscriptionRepo.create({
          tenantId: tenant.id,
          plan: planId as any,
          status: 'trial',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })

        await this.subscriptionRepo.createInvoice({
          subscriptionId: subscription.id,
          amount: plan.priceMonthly,
          status: 'pending',
          periodStart: subscription.currentPeriodStart,
          periodEnd: subscription.currentPeriodEnd,
        })

        for (const feature of plan.features) {
          await this.tenantRepo.upsertFeatureFlag(tenant.id, feature, true)
        }
      }

      return {
        company: { id: tenant.id, name: tenant.name },
        admin: { id: user.id, email: user.email, name: user.name, tenantRole: user.tenantRole ?? 'admin', globalRole: user.globalRole ?? null },
        credentials: { email: data.adminEmail, password: rawPassword },
      }
    })
  }

  private generatePassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'
    return Array.from(crypto.randomBytes(length), (byte) => chars[byte % chars.length]).join('')
  }
}
