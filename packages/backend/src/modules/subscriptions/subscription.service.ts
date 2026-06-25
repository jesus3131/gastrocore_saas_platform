import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'
import { SUBSCRIPTION_PLANS } from '@gastrocore/shared'

export class SubscriptionService {
  async getPlans() {
    return Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
      id,
      ...plan,
    }))
  }

  async getCurrentSubscription(tenantId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { invoices: { orderBy: { createdAt: 'desc' }, take: 6 } },
    })

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { subscriptionPlan: true, subscriptionStatus: true },
    })

    return { subscription, currentPlan: tenant }
  }

  async changePlan(tenantId: string, newPlan: string) {
    const validPlans = ['basic', 'pro', 'enterprise']
    if (!validPlans.includes(newPlan)) {
      throw new AppError(400, 'INVALID_PLAN', `Plan must be one of: ${validPlans.join(', ')}`)
    }

    const plan = SUBSCRIPTION_PLANS[newPlan as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) throw new AppError(404, 'PLAN_NOT_FOUND', 'Plan not found')

    // Update tenant
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { subscriptionPlan: newPlan as any },
    })

    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        tenantId,
        plan: newPlan as any,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    // Create invoice
    await prisma.subscriptionInvoice.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.priceMonthly,
        status: 'pending',
        periodStart: subscription.currentPeriodStart,
        periodEnd: subscription.currentPeriodEnd,
      },
    })

    // Sync feature flags with new plan
    await prisma.tenantFeatureFlag.deleteMany({ where: { tenantId } })
    for (const feature of plan.features) {
      await prisma.tenantFeatureFlag.create({
        data: { tenantId, feature, enabled: true },
      })
    }

    return { subscription, plan }
  }

  async getInvoices(tenantId: string) {
    return prisma.subscriptionInvoice.findMany({
      where: { subscription: { tenantId } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    })
  }
}
