import { inject, injectable } from 'tsyringe'
import { AppError } from '../../common/filters/error-handler.js'
import { logger } from '../../config/logger.js'
import { SUBSCRIPTION_PLANS } from '@gastrocore/shared'
import { sendCredentialsEmail } from '../notifications/email.service.js'
import { ChangePlanUseCase } from '../../core/use-cases/subscriptions/change-plan.use-case.js'
import type { SubscriptionRepository } from '../../core/ports/repositories/subscription.repository.js'
import type { TenantRepository } from '../../core/ports/repositories/tenant.repository.js'

@injectable()
export class SubscriptionService {
  constructor(
    @inject('SubscriptionRepository') private readonly subscriptionRepo: SubscriptionRepository,
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
    private readonly changePlanUseCase?: ChangePlanUseCase,
  ) {}

  async getPlans() {
    return Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
      id,
      ...plan,
    }))
  }

  async getCurrentSubscription(tenantId: string) {
    const subscription = await this.subscriptionRepo.findFirst(
      { tenantId },
      { invoices: { orderBy: { createdAt: 'desc' }, take: 6 } },
    )

    const tenant = await this.tenantRepo.findById(tenantId, {
      subscriptionPlan: true, subscriptionStatus: true, customFields: true,
    })

    const plan = tenant ? SUBSCRIPTION_PLANS[tenant.subscriptionPlan as keyof typeof SUBSCRIPTION_PLANS] : null
    const extraUsers = (tenant?.customFields as any)?.extraUsers || 0

    return {
      subscription,
      currentPlan: tenant,
      plan: plan ? { ...plan, id: tenant?.subscriptionPlan } : null,
      extraUsers,
    }
  }

  async changePlan(tenantId: string, newPlan: string) {
    if (this.changePlanUseCase) {
      return this.changePlanUseCase.execute(tenantId, newPlan)
    }

    const validPlans = ['basic', 'pro', 'enterprise']
    if (!validPlans.includes(newPlan)) {
      throw new AppError(400, 'INVALID_PLAN', `Plan must be one of: ${validPlans.join(', ')}`)
    }

    const plan = SUBSCRIPTION_PLANS[newPlan as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) throw new AppError(404, 'PLAN_NOT_FOUND', 'Plan not found')

    await this.tenantRepo.update(tenantId, { subscriptionPlan: newPlan as any })

    const subscription = await this.subscriptionRepo.create({
      tenantId,
      plan: newPlan as any,
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

    await this.tenantRepo.deleteFeatureFlags({ tenantId })
    for (const feature of plan.features) {
      await this.tenantRepo.upsertFeatureFlag(tenantId, feature, true)
    }

    this.notifyPlanChange(tenantId, newPlan)

    return { subscription, plan }
  }

  private async notifyPlanChange(tenantId: string, newPlan: string) {
    try {
      const admins = await this.tenantRepo.findManyAdmins(tenantId)
      for (const admin of admins) {
        await sendCredentialsEmail(admin.email, admin.email, '')
      }
    } catch (err) {
      logger.warn({ err, tenantId }, 'Failed to notify plan change')
    }
  }

  async getInvoices(tenantId: string) {
    return this.subscriptionRepo.findInvoices(tenantId)
  }
}
