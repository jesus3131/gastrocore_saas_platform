import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'
import { sendWelcomeEmail } from '../notifications/email.service.js'
import { SUBSCRIPTION_PLANS } from '@gastrocore/shared'

export class SuperAdminService {
  private readonly saltRounds = 12

  async getCompanies() {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { role: 'admin' },
          select: { id: true, email: true, name: true, createdAt: true },
          take: 1,
        },
        _count: { select: { users: true, branches: true } },
      },
    })
    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      businessType: t.businessType,
      subscriptionPlan: t.subscriptionPlan,
      subscriptionStatus: t.subscriptionStatus,
      locale: t.locale,
      timezone: t.timezone,
      currency: t.currency,
      admin: t.users[0] || null,
      userCount: t._count.users,
      branchCount: t._count.branches,
      createdAt: t.createdAt,
    }))
  }

  async getCompany(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          where: { role: 'admin' },
          select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, lastLoginAt: true },
        },
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 3, include: { invoices: true } },
        _count: { select: { users: true, branches: true, orders: true, customers: true } },
      },
    })
    if (!tenant) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found')
    return tenant
  }

  async createCompany(data: {
    companyName: string
    adminName: string
    adminEmail: string
    businessType: string
    planId: string
  }) {
    const existing = await prisma.user.findFirst({ where: { email: data.adminEmail } })
    if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered')

    const rawPassword = this.generatePassword()
    const passwordHash = await bcrypt.hash(rawPassword, this.saltRounds)

    const planId = (data.planId || 'basic') as keyof typeof SUBSCRIPTION_PLANS
    const plan = SUBSCRIPTION_PLANS[planId]

    const tenant = await prisma.tenant.create({
      data: {
        name: data.companyName,
        slug: data.companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        businessType: data.businessType as never,
        subscriptionPlan: planId,
        subscriptionStatus: 'trial',
      },
    })

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: data.adminEmail,
        passwordHash,
        name: data.adminName,
        role: 'admin',
      },
    })

    if (plan) {
      const subscription = await prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          plan: planId as any,
          status: 'trial',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      await prisma.subscriptionInvoice.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.priceMonthly,
          status: 'pending',
          periodStart: subscription.currentPeriodStart,
          periodEnd: subscription.currentPeriodEnd,
        },
      })

      for (const feature of plan.features) {
        await prisma.tenantFeatureFlag.create({
          data: { tenantId: tenant.id, feature, enabled: true },
        })
      }
    }

    // Send credentials email (non-blocking)
    sendWelcomeEmail(data.adminEmail, data.adminName, data.adminEmail, rawPassword)
      .then((sent) => {
        if (sent) console.log(`[SuperAdmin] Welcome email sent to ${data.adminEmail}`)
        else console.warn(`[SuperAdmin] Could not send welcome email to ${data.adminEmail}`)
      })
      .catch((err) => console.warn(`[SuperAdmin] Email error:`, err.message))

    return {
      company: { id: tenant.id, name: tenant.name },
      admin: { id: user.id, email: user.email, name: user.name },
      credentials: { email: data.adminEmail, password: rawPassword },
    }
  }

  async resendCredentials(companyId: string) {
    const admin = await prisma.user.findFirst({
      where: { tenantId: companyId, role: 'admin', isActive: true },
    })
    if (!admin) throw new AppError(404, 'ADMIN_NOT_FOUND', 'No active admin found for this company')

    const rawPassword = this.generatePassword()
    const passwordHash = await bcrypt.hash(rawPassword, this.saltRounds)

    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash },
    })

    sendWelcomeEmail(admin.email, admin.name, admin.email, rawPassword)
      .then((sent) => {
        if (sent) console.log(`[SuperAdmin] Credentials re-sent to ${admin.email}`)
        else console.warn(`[SuperAdmin] Could not resend credentials to ${admin.email}`)
      })
      .catch((err) => console.warn(`[SuperAdmin] Email error:`, err.message))

    return { message: 'Credentials re-sent successfully', email: admin.email }
  }

  private generatePassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'
    return Array.from(crypto.randomBytes(length), (byte) => chars[byte % chars.length]).join('')
  }
}
