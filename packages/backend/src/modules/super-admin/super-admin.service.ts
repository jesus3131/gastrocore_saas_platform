import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'
import { sendWelcomeEmail } from '../notifications/email.service.js'
import { SUBSCRIPTION_PLANS } from '@gastrocore/shared'
import { CreateCompanyUseCase } from '../../core/use-cases/super-admin/create-company.use-case.js'

export class SuperAdminService {
  private readonly saltRounds = 12

  constructor(private readonly createCompanyUseCase?: CreateCompanyUseCase) {}

  async getCompanies() {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { role: 'admin' },
          select: { id: true, email: true, name: true, createdAt: true },
          take: 1,
        },
        featureFlags: { select: { feature: true, enabled: true } },
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
      taxId: (t.customFields as any)?.taxId || null,
      address: (t.customFields as any)?.address || null,
      phone: (t.customFields as any)?.phone || null,
      extraUsers: (t.customFields as any)?.extraUsers || 0,
      features: t.featureFlags,
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
        featureFlags: { select: { feature: true, enabled: true } },
        _count: { select: { users: true, branches: true, orders: true, customers: true } },
      },
    })
    if (!tenant) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found')
    return {
      ...tenant,
      taxId: (tenant.customFields as any)?.taxId || null,
      address: (tenant.customFields as any)?.address || null,
      phone: (tenant.customFields as any)?.phone || null,
      extraUsers: (tenant.customFields as any)?.extraUsers || 0,
    }
  }

  async createCompany(data: {
    companyName: string
    adminName: string
    adminEmail: string
    businessType: string
    planId: string
    taxId?: string
    address?: string
    phone?: string
  }) {
    if (this.createCompanyUseCase) {
      const result = await this.createCompanyUseCase.execute(data)

      sendWelcomeEmail(data.adminEmail, data.adminName, data.adminEmail, result.credentials.password)
        .then((sent) => {
          if (sent) console.log(`[SuperAdmin] Welcome email sent to ${data.adminEmail}`)
          else console.warn(`[SuperAdmin] Could not send welcome email to ${data.adminEmail}`)
        })
        .catch((err) => console.warn(`[SuperAdmin] Email error:`, err.message))

      return result
    }

    const existing = await prisma.user.findFirst({ where: { email: data.adminEmail } })
    if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered')

    const rawPassword = this.generatePassword()
    const passwordHash = await bcrypt.hash(rawPassword, this.saltRounds)

    const planId = (data.planId || 'basic') as keyof typeof SUBSCRIPTION_PLANS
    const plan = SUBSCRIPTION_PLANS[planId]

    const customFields: Record<string, unknown> = {}
    if (data.taxId) customFields.taxId = data.taxId
    if (data.address) customFields.address = data.address
    if (data.phone) customFields.phone = data.phone

    const tenant = await prisma.tenant.create({
      data: {
        name: data.companyName,
        slug: data.companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        businessType: data.businessType as never,
        subscriptionPlan: planId,
        subscriptionStatus: 'trial',
        customFields: customFields as any,
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

  async updateCompany(id: string, data: {
    companyName?: string
    businessType?: string
    planId?: string
    taxId?: string
    address?: string
    phone?: string
    extraUsers?: number
  }) {
    const tenant = await prisma.tenant.findUnique({ where: { id } })
    if (!tenant) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found')

    const customFields = { ...(tenant.customFields as Record<string, unknown>) }
    const updateData: Record<string, unknown> = {}

    if (data.companyName) updateData.name = data.companyName
    if (data.businessType) updateData.businessType = data.businessType
    if (data.planId) updateData.subscriptionPlan = data.planId

    if (data.taxId !== undefined) customFields.taxId = data.taxId
    if (data.address !== undefined) customFields.address = data.address
    if (data.phone !== undefined) customFields.phone = data.phone
    if (data.extraUsers !== undefined) customFields.extraUsers = data.extraUsers

    updateData.customFields = customFields

    const updated = await prisma.tenant.update({ where: { id }, data: updateData as any })

    if (data.planId) {
      const plan = SUBSCRIPTION_PLANS[data.planId as keyof typeof SUBSCRIPTION_PLANS]
      if (plan) {
        await prisma.subscription.create({
          data: {
            tenantId: id,
            plan: data.planId as any,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        await prisma.tenantFeatureFlag.deleteMany({ where: { tenantId: id } })
        for (const feature of plan.features) {
          await prisma.tenantFeatureFlag.create({ data: { tenantId: id, feature, enabled: true } })
        }
      }
    }

    return { id: updated.id, name: updated.name, businessType: updated.businessType, subscriptionPlan: updated.subscriptionPlan, customFields: updated.customFields }
  }

  async updateModules(companyId: string, features: { feature: string; enabled: boolean }[]) {
    const tenant = await prisma.tenant.findUnique({ where: { id: companyId } })
    if (!tenant) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found')

    for (const f of features) {
      await prisma.tenantFeatureFlag.upsert({
        where: { tenantId_feature: { tenantId: companyId, feature: f.feature } },
        create: { tenantId: companyId, feature: f.feature, enabled: f.enabled },
        update: { enabled: f.enabled },
      })
    }

    return { message: 'Modules updated successfully' }
  }

  async resendCredentials(companyId: string) {
    const admin = await prisma.user.findFirst({ where: { tenantId: companyId, role: 'admin', isActive: true } })
    if (!admin) throw new AppError(404, 'ADMIN_NOT_FOUND', 'No active admin found for this company')

    const rawPassword = this.generatePassword()
    const passwordHash = await bcrypt.hash(rawPassword, this.saltRounds)

    await prisma.user.update({ where: { id: admin.id }, data: { passwordHash } })

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
