import { injectable, inject } from 'tsyringe'
import type { TenantRepository } from '../../ports/repositories/tenant.repository.js'
import type { SubscriptionRepository } from '../../ports/repositories/subscription.repository.js'

@injectable()
export class ChangePlanUseCase {
  constructor(
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
    @inject('SubscriptionRepository') private readonly subscriptionRepo: SubscriptionRepository,
  ) {}

  async execute(tenantId: string, newPlan: string) {
    const { SUBSCRIPTION_PLANS } = await import('@gastrocore/shared')

    const validPlans = ['basic', 'pro', 'enterprise']
    if (!validPlans.includes(newPlan)) {
      const { AppError } = await import('../../../common/filters/error-handler.js')
      throw new AppError(400, 'INVALID_PLAN', `Plan must be one of: ${validPlans.join(', ')}`)
    }

    const plan = SUBSCRIPTION_PLANS[newPlan as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) {
      const { AppError } = await import('../../../common/filters/error-handler.js')
      throw new AppError(404, 'PLAN_NOT_FOUND', 'Plan not found')
    }

    await this.tenantRepo.update(tenantId, { subscriptionPlan: newPlan })

    const subscription = await this.subscriptionRepo.create({
      tenantId,
      plan: newPlan,
      status: 'active',
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

    const flags = await this.tenantRepo.getFeatureFlags(tenantId)
    for (const flag of flags) {
      await this.tenantRepo.upsertFeatureFlag(tenantId, flag.feature, false)
    }
    for (const feature of plan.features) {
      await this.tenantRepo.upsertFeatureFlag(tenantId, feature, true)
    }

    return { subscription, plan: { ...plan, id: newPlan } }
  }
}
