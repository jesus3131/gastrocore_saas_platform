import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { inject, injectable } from 'tsyringe'
import { AppError } from '../../common/filters/error-handler.js'
import { logger } from '../../config/logger.js'
import { sendWelcomeEmail } from '../notifications/email.service.js'
import { SUBSCRIPTION_PLANS, FEATURE_LABELS } from '@gastrocore/shared'
import { CreateCompanyUseCase } from '../../core/use-cases/super-admin/create-company.use-case.js'
import type { TenantRepository } from '../../core/ports/repositories/tenant.repository.js'
import type { UserRepository } from '../../core/ports/repositories/user.repository.js'
import type { SubscriptionRepository } from '../../core/ports/repositories/subscription.repository.js'

@injectable()
export class SuperAdminService {
  private readonly saltRounds = 12

  constructor(
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
    @inject('UserRepository') private readonly userRepo: UserRepository,
    @inject('SubscriptionRepository') private readonly subscriptionRepo: SubscriptionRepository,
    private readonly createCompanyUseCase?: CreateCompanyUseCase,
  ) {}

  async getCompanies() {
    const tenants = await this.tenantRepo.findManyTenants({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { tenantRole: 'admin' },
          select: { id: true, email: true, name: true, createdAt: true },
          take: 1,
        },
        featureFlags: { select: { feature: true, enabled: true } },
        _count: { select: { users: true, branches: true } },
      },
    })
    return tenants.map((t: any) => ({
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
    const tenant = await this.tenantRepo.findById(id)
    if (!tenant) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found')

    // Need to fetch with includes separately since findById doesn't support it
    const tenantFull = await this.tenantRepo.findManyTenants({
      where: { id },
      include: {
        users: {
          where: { tenantRole: 'admin' },
          select: { id: true, email: true, name: true, tenantRole: true, globalRole: true, isActive: true, createdAt: true, lastLoginAt: true },
        },
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 3, include: { invoices: true } },
        featureFlags: { select: { feature: true, enabled: true } },
        _count: { select: { users: true, branches: true, orders: true, customers: true } },
      },
    })

    const full = tenantFull[0]
    return {
      ...full,
      taxId: (full.customFields as any)?.taxId || null,
      address: (full.customFields as any)?.address || null,
      phone: (full.customFields as any)?.phone || null,
      extraUsers: (full.customFields as any)?.extraUsers || 0,
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
          if (sent) logger.info({ email: data.adminEmail }, 'SuperAdmin: welcome email sent')
          else logger.warn({ email: data.adminEmail }, 'SuperAdmin: could not send welcome email')
        })
        .catch((err) => logger.warn({ err, email: data.adminEmail }, 'SuperAdmin: email error'))

      return result
    }

    const existing = await this.userRepo.findFirst({ where: { email: data.adminEmail } })
    if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered')

    const rawPassword = this.generatePassword()
    const passwordHash = await bcrypt.hash(rawPassword, this.saltRounds)

    const planId = (data.planId || 'basic') as keyof typeof SUBSCRIPTION_PLANS
    const plan = SUBSCRIPTION_PLANS[planId]

    const customFields: Record<string, unknown> = {}
    if (data.taxId) customFields.taxId = data.taxId
    if (data.address) customFields.address = data.address
    if (data.phone) customFields.phone = data.phone

    const tenant = await this.tenantRepo.create({
      name: data.companyName,
      slug: data.companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      businessType: data.businessType as never,
      subscriptionPlan: planId,
      subscriptionStatus: 'trial',
      customFields: customFields as any,
    })

    const { prisma } = await import('../../config/database/prisma.js')
    const employee = await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        name: data.adminName,
        email: data.adminEmail,
        role: 'admin',
      },
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

    sendWelcomeEmail(data.adminEmail, data.adminName, data.adminEmail, rawPassword)
      .then((sent) => {
        if (sent) logger.info({ email: data.adminEmail }, 'SuperAdmin: welcome email sent')
        else logger.warn({ email: data.adminEmail }, 'SuperAdmin: could not send welcome email')
      })
      .catch((err) => logger.warn({ err, email: data.adminEmail }, 'SuperAdmin: email error'))

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
    const tenant = await this.tenantRepo.findById(id)
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

    const updated = await this.tenantRepo.update(id, updateData as any)

    if (data.planId) {
      const plan = SUBSCRIPTION_PLANS[data.planId as keyof typeof SUBSCRIPTION_PLANS]
      if (plan) {
        await this.subscriptionRepo.create({
          tenantId: id,
          plan: data.planId as any,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })

        await this.tenantRepo.deleteFeatureFlags({ tenantId: id })
        for (const feature of plan.features) {
          await this.tenantRepo.upsertFeatureFlag(id, feature, true)
        }
      }
    }

    return { id: updated.id, name: updated.name, businessType: updated.businessType, subscriptionPlan: updated.subscriptionPlan, customFields: updated.customFields }
  }

  async updateModules(companyId: string, features: { feature: string; enabled: boolean }[]) {
    const tenant = await this.tenantRepo.findById(companyId)
    if (!tenant) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found')

    for (const f of features) {
      await this.tenantRepo.upsertFeatureFlag(companyId, f.feature, f.enabled)
    }

    return { message: 'Modules updated successfully' }
  }

  async resendCredentials(companyId: string) {
    const admin = await this.tenantRepo.findUsersByTenant(companyId, { tenantRole: 'admin', isActive: true })
    if (!admin.length) throw new AppError(404, 'ADMIN_NOT_FOUND', 'No active admin found for this company')

    const rawPassword = this.generatePassword()
    const passwordHash = await bcrypt.hash(rawPassword, this.saltRounds)

    await this.tenantRepo.updateAdminPassword(admin[0].id, passwordHash)

    sendWelcomeEmail(admin[0].email, admin[0].name, admin[0].email, rawPassword)
      .then((sent) => {
        if (sent) logger.info({ email: admin[0].email }, 'SuperAdmin: credentials re-sent')
        else logger.warn({ email: admin[0].email }, 'SuperAdmin: could not resend credentials')
      })
      .catch((err) => logger.warn({ err, email: admin[0].email }, 'SuperAdmin: email error'))

    return { message: 'Credentials re-sent successfully', email: admin[0].email }
  }

  private generatePassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'
    return Array.from(crypto.randomBytes(length), (byte) => chars[byte % chars.length]).join('')
  }

  // ─── TENANT MANAGEMENT ─────────────────────────────────────────

  async deleteCompany(id: string, adminId: string) {
    const tenant = await this.tenantRepo.findById(id)
    if (!tenant) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found')

    const { prisma } = await import('../../config/database/prisma.js')
    await prisma.tenant.delete({ where: { id } })

    await this.logAction(adminId, 'tenant.delete', 'warning',
      `Deleted company "${tenant.name}" (${id})`)

    return { message: 'Company deleted successfully' }
  }

  async migratePlan(id: string, newPlan: string) {
    const tenant = await this.tenantRepo.findById(id)
    if (!tenant) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found')

    const plan = SUBSCRIPTION_PLANS[newPlan as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) throw new AppError(400, 'INVALID_PLAN', `Plan "${newPlan}" not found`)

    const updated = await this.tenantRepo.update(id, { subscriptionPlan: newPlan } as any)

    await this.subscriptionRepo.create({
      tenantId: id,
      plan: newPlan as any,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })

    await this.tenantRepo.deleteFeatureFlags({ tenantId: id })
    for (const feature of plan.features) {
      await this.tenantRepo.upsertFeatureFlag(id, feature, true)
    }

    return {
      id: updated.id,
      name: updated.name,
      subscriptionPlan: updated.subscriptionPlan,
      mrr: plan.priceMonthly,
      features: plan.features,
    }
  }

  async toggleTenantStatus(id: string) {
    const tenant = await this.tenantRepo.findById(id)
    if (!tenant) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company not found')

    const newStatus = tenant.subscriptionStatus === 'active' ? 'suspended' : 'active'
    const updated = await this.tenantRepo.update(id, { subscriptionStatus: newStatus } as any)

    return { id: updated.id, name: updated.name, status: updated.subscriptionStatus }
  }

  // ─── BILLING / INVOICES ────────────────────────────────────────

  async getInvoices(opts?: { tenantId?: string; status?: string }) {
    const { prisma } = await import('../../config/database/prisma.js')

    const where: Record<string, unknown> = {}
    if (opts?.tenantId) where.tenantId = opts.tenantId
    if (opts?.status) where.status = opts.status

    const invoices = await prisma.invoice.findMany({
      where,
      include: { tenant: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return invoices.map((inv: any) => ({
      id: inv.id,
      tenantId: inv.tenantId,
      tenantName: inv.tenant?.name || null,
      description: inv.description,
      amount: Number(inv.amount),
      currency: inv.currency,
      status: inv.status,
      paymentMethod: inv.paymentMethod,
      dueDate: inv.dueDate,
      paidAt: inv.paidAt,
      createdAt: inv.createdAt,
    }))
  }

  async markInvoicePaid(invoiceId: string, adminId: string, paymentMethod?: string) {
    const { prisma } = await import('../../config/database/prisma.js')

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice) throw new AppError(404, 'INVOICE_NOT_FOUND', 'Invoice not found')
    if (invoice.status === 'paid') throw new AppError(409, 'ALREADY_PAID', 'Invoice is already paid')

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'paid', paidAt: new Date(), paymentMethod: paymentMethod || null },
    })

    await this.logAction(adminId, 'invoice.mark-paid', 'success',
      `Marked invoice ${invoiceId} as paid (${Number(invoice.amount)} ${invoice.currency})`)

    return {
      id: updated.id,
      status: updated.status,
      paidAt: updated.paidAt,
      amount: Number(updated.amount),
      currency: updated.currency,
    }
  }

  async createManualInvoice(data: {
    tenantId: string
    description: string
    amount: number
    currency?: string
    dueDate: string
    adminId: string
  }) {
    const { prisma } = await import('../../config/database/prisma.js')

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: data.tenantId,
        description: data.description,
        amount: data.amount,
        currency: data.currency || 'MXN',
        dueDate: new Date(data.dueDate),
      },
    })

    await this.logAction(data.adminId, 'invoice.create', 'info',
      `Created manual invoice for tenant ${data.tenantId}: ${data.description} (${data.amount})`)

    return {
      id: invoice.id,
      description: invoice.description,
      amount: Number(invoice.amount),
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      status: invoice.status,
    }
  }

  // ─── CALENDAR EVENTS ───────────────────────────────────────────

  async getCalendarEvents(dateFrom?: string, dateTo?: string) {
    const { prisma } = await import('../../config/database/prisma.js')

    const where: Record<string, unknown> = {}
    if (dateFrom || dateTo) {
      where.eventDate = {}
      if (dateFrom) (where.eventDate as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.eventDate as Record<string, unknown>).lte = new Date(dateTo)
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: { tenant: { select: { id: true, name: true } } },
      orderBy: { eventDate: 'asc' },
    })

    return events.map((ev: any) => ({
      id: ev.id,
      tenantId: ev.tenantId,
      tenantName: ev.tenant?.name || null,
      title: ev.title,
      description: ev.description,
      category: ev.category,
      eventDate: ev.eventDate,
      startTime: ev.startTime,
      endTime: ev.endTime,
      color: ev.color,
      allDay: ev.allDay,
      createdBy: ev.createdBy,
      createdAt: ev.createdAt,
    }))
  }

  async createCalendarEvent(data: {
    tenantId?: string
    title: string
    description?: string
    category: string
    eventDate: string
    startTime?: string
    endTime?: string
    color?: string
    allDay?: boolean
    createdBy: string
  }) {
    const { prisma } = await import('../../config/database/prisma.js')

    const event = await prisma.calendarEvent.create({
      data: {
        tenantId: data.tenantId || null,
        title: data.title,
        description: data.description || null,
        category: data.category as any,
        eventDate: new Date(data.eventDate),
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        color: data.color || '#f59e0b',
        allDay: data.allDay || false,
        createdBy: data.createdBy,
      },
    })

    await this.logAction(data.createdBy, 'calendar.create', 'info',
      `Created calendar event "${data.title}" on ${data.eventDate}`)

    return event
  }

  async deleteCalendarEvent(eventId: string, adminId: string) {
    const { prisma } = await import('../../config/database/prisma.js')

    const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Calendar event not found')

    await prisma.calendarEvent.delete({ where: { id: eventId } })

    await this.logAction(adminId, 'calendar.delete', 'warning',
      `Deleted calendar event "${event.title}"`)

    return { message: 'Event deleted successfully' }
  }

  // ─── AUDIT LOGS ────────────────────────────────────────────────

  async getAuditLogs(opts?: {
    severity?: string
    action?: string
    adminId?: string
    limit?: number
    offset?: number
  }) {
    const { prisma } = await import('../../config/database/prisma.js')

    const where: Record<string, unknown> = {}
    if (opts?.severity) where.severity = opts.severity
    if (opts?.action) where.action = opts.action
    if (opts?.adminId) where.adminId = opts.adminId

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        include: { admin: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: opts?.limit || 100,
        skip: opts?.offset || 0,
      }),
      prisma.systemLog.count({ where }),
    ])

    return {
      logs: logs.map((log: any) => ({
        id: log.id,
        adminName: log.admin?.name || 'Unknown',
        adminEmail: log.admin?.email || null,
        action: log.action,
        severity: log.severity,
        message: log.message,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
      total,
    }
  }

  async getDashboardMetrics() {
    const { prisma } = await import('../../config/database/prisma.js')

    const [
      totalTenants,
      activeTenants,
      totalUsers,
      totalOrders,
      totalRevenue,
      recentActivity,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { subscriptionStatus: 'active' } }),
      prisma.user.count({ where: { tenantRole: { not: undefined } } }),
      prisma.order.count(),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.systemLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { name: true } } },
      }),
    ])

    const planDistribution = await prisma.tenant.groupBy({
      by: ['subscriptionPlan'],
      _count: true,
    })

    return {
      totalTenants,
      activeTenants,
      suspendedTenants: totalTenants - activeTenants,
      totalUsers,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      planDistribution: planDistribution.map((p: any) => ({
        plan: p.subscriptionPlan,
        count: p._count,
      })),
      recentActivity: recentActivity.map((a: any) => ({
        id: a.id,
        adminName: a.admin?.name || 'System',
        action: a.action,
        message: a.message,
        createdAt: a.createdAt,
      })),
    }
  }

  // ─── PLANS ─────────────────────────────────────────────────────

  async getPlans() {
    return Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      maxUsers: plan.maxUsers,
      maxBranches: plan.maxBranches,
      maxTransactions: plan.maxTransactions,
      storageGb: plan.storageGb,
      features: plan.features.map((f) => ({
        id: f,
        label: FEATURE_LABELS[f] || f,
      })),
    }))
  }

  // ─── SYSTEM HEALTH ─────────────────────────────────────────────

  async getSystemHealth() {
    const checks: Record<string, string> = {}

    try {
      const { prisma } = await import('../../config/database/prisma.js')
      await prisma.$queryRaw`SELECT 1`
      checks.database = 'healthy'
    } catch {
      checks.database = 'unhealthy'
    }

    try {
      const { getRedis } = await import('../../config/redis/redis.js')
      const redis = getRedis()
      await redis.ping()
      checks.redis = 'healthy'
    } catch {
      checks.redis = 'unhealthy'
    }

    checks.api = 'healthy'

    const overall = Object.values(checks).every((s) => s === 'healthy') ? 'healthy' : 'degraded'

    return { overall, checks, timestamp: new Date().toISOString() }
  }

  // ─── ANNOUNCEMENTS ─────────────────────────────────────────────

  async createAnnouncement(data: {
    title: string
    message: string
    severity: string
    audience?: string
    adminId: string
  }) {
    await this.logAction(data.adminId, 'announcement.create', data.severity,
      `[${data.audience || 'all'}] ${data.title}: ${data.message}`,
      { title: data.title, audience: data.audience || 'all' })

    return {
      title: data.title,
      message: data.message,
      severity: data.severity,
      audience: data.audience || 'all',
      createdAt: new Date().toISOString(),
    }
  }

  // ─── SYSTEM LOGGING ────────────────────────────────────────────

  private async logAction(adminId: string, action: string, severity: string, message: string, metadata?: Record<string, unknown>) {
    try {
      const { prisma } = await import('../../config/database/prisma.js')
      await prisma.systemLog.create({
        data: {
          adminId,
          action,
          severity: severity as any,
          message,
          metadata: (metadata || {}) as any,
        },
      })
    } catch (err) {
      logger.error({ err }, 'SuperAdmin: failed to write system log')
    }
  }
}
