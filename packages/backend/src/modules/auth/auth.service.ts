import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { inject, injectable } from 'tsyringe'
import { env } from '../../config/env.js'
import { AppError } from '../../common/filters/error-handler.js'
import { logger } from '../../config/logger.js'
import { sendWelcomeEmail } from '../notifications/email.service.js'
import type { JwtPayload, AuthTokens } from '@gastrocore/shared'
import { RegisterTenantUseCase } from '../../core/use-cases/auth/register-tenant.use-case.js'
import type { UserRepository } from '../../core/ports/repositories/user.repository.js'
import type { TenantRepository } from '../../core/ports/repositories/tenant.repository.js'
import type { SubscriptionRepository } from '../../core/ports/repositories/subscription.repository.js'
import type { RefreshTokenRepository } from '../../core/ports/repositories/refresh-token.repository.js'

@injectable()
export class AuthService {
  private readonly saltRounds = 12

  constructor(
    @inject('UserRepository') private readonly userRepo: UserRepository,
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
    @inject('SubscriptionRepository') private readonly subscriptionRepo: SubscriptionRepository,
    @inject('RefreshTokenRepository') private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly registerTenant?: RegisterTenantUseCase,
  ) {}

  /**
   * Nivel 1 - Super Admin login: email + password, sin tenantId.
   * Solo para usuarios con role=super_admin y tenantId=null.
   */
  async superAdminLogin(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email)
    if (!user || !user.isActive || user.globalRole !== 'super_admin') {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid super admin credentials')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid super admin credentials')
    }

    const tokens = this.generateTokens({
      sub: user.id,
      globalRole: 'super_admin',
      email: user.email,
      authMethod: 'password',
    })

    await this.storeRefreshToken(user.id, tokens.refreshToken)
    await this.userRepo.update(user.id, { lastLoginAt: new Date() })

    const { passwordHash, refreshToken, ...safeUser } = user
    return { user: safeUser, tokens }
  }

  /**
   * Nivel 2+3 - Login estándar para Admin de Empresa y empleados.
   */
  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email)
    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    }
    if (!user.tenantId) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Use super admin login endpoint')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    }

    const tokens = this.generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      globalRole: user.globalRole as JwtPayload['globalRole'],
      tenantRole: user.tenantRole as JwtPayload['tenantRole'],
      email: user.email,
      authMethod: 'password',
    })

    await this.storeRefreshToken(user.id, tokens.refreshToken)

    let tenant: any = null
    let flags: any[] = []

    tenant = await this.tenantRepo.findById(user.tenantId, {
      name: true, subscriptionPlan: true, subscriptionStatus: true, settings: true, currency: true,
    })

    flags = await this.tenantRepo.getFeatureFlags(user.tenantId, { enabled: true })

    await this.userRepo.update(user.id, { lastLoginAt: new Date() })

    const { passwordHash, refreshToken, ...safeUser } = user
    return { user: { ...safeUser, tenantName: tenant?.name, tenantPlan: tenant?.subscriptionPlan, tenantCurrency: tenant?.currency, onboardingCompleted: (tenant?.settings as any)?.onboardingCompleted || false, featureFlags: flags.map(f => f.feature) }, tokens }
  }

  async register(data: {
    email: string
    password?: string
    name: string
    tenantName: string
    businessType: string
    planId?: string
  }) {
    if (!data.tenantName || !data.businessType) {
      throw new AppError(400, 'INVALID_REGISTER_REQUEST', 'Tenant onboarding data is required')
    }
    if (this.registerTenant) {
      const result = await this.registerTenant.execute(data)

      const tokens = this.generateTokens({
        sub: result.user.id,
        tenantId: result.tenant.id,
        globalRole: result.user.globalRole as JwtPayload['globalRole'],
        tenantRole: result.user.tenantRole as JwtPayload['tenantRole'],
        email: result.user.email,
        authMethod: 'password',
      })

      await this.storeRefreshToken(result.user.id, tokens.refreshToken)

      sendWelcomeEmail(data.email, data.name, data.email, result.credentials.password)
        .then((sent) => {
          if (sent) logger.info({ email: data.email }, 'Welcome email sent')
          else logger.warn({ email: data.email }, 'Could not send welcome email')
        })
        .catch((err) => logger.warn({ err, email: data.email }, 'Email error'))

      return { ...result, tokens }
    }

    const { SUBSCRIPTION_PLANS } = await import('@gastrocore/shared')

    const existing = await this.userRepo.findFirst({ where: { email: data.email } })
    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered')
    }

    const rawPassword = data.password || this.generatePassword()
    const passwordHash = await bcrypt.hash(rawPassword, this.saltRounds)

    const planId = (data.planId || 'basic') as keyof typeof SUBSCRIPTION_PLANS
    const plan = SUBSCRIPTION_PLANS[planId]

    const tenant = await this.tenantRepo.create({
      name: data.tenantName,
      slug: data.tenantName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      businessType: data.businessType as never,
      subscriptionPlan: planId,
      subscriptionStatus: 'trial',
    })

    const { prisma } = await import('../../config/database/prisma.js')
    const employee = await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        name: data.name,
        email: data.email,
        role: 'admin',
      },
    })

    const user = await this.userRepo.create({
      tenantId: tenant.id,
      employeeId: employee.id,
      email: data.email,
      passwordHash,
      name: data.name,
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

    const tokens = this.generateTokens({
      sub: user.id,
      tenantId: user.tenantId ?? undefined,
      globalRole: user.globalRole as JwtPayload['globalRole'],
      tenantRole: user.tenantRole as JwtPayload['tenantRole'],
      email: user.email,
      authMethod: 'password',
    })

    await this.storeRefreshToken(user.id, tokens.refreshToken)

    sendWelcomeEmail(data.email, data.name, data.email, rawPassword)
      .then((sent) => {
        if (sent) logger.info({ email: data.email }, 'Welcome email sent')
        else logger.warn({ email: data.email }, 'Could not send welcome email')
      })
      .catch((err) => logger.warn({ err, email: data.email }, 'Email error'))

    return {
      user: { id: user.id, email: user.email, name: user.name, tenantRole: user.tenantRole, globalRole: user.globalRole },
      tenant,
      tokens,
      credentials: { email: data.email, password: rawPassword },
    }
  }

  private generatePassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'
    return Array.from(crypto.randomBytes(length), (byte) => chars[byte % chars.length]).join('')
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken)
    const family = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.refreshTokenRepo.create(userId, tokenHash, family, expiresAt)
  }

  async refresh(token: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(token)
    const stored = await this.refreshTokenRepo.findValid(tokenHash)
    if (!stored) throw new AppError(401, 'INVALID_REFRESH', 'Invalid or expired refresh token')

    await this.refreshTokenRepo.revoke(stored.id)

    const user = await this.userRepo.findById(stored.userId)
    if (!user) throw new AppError(401, 'USER_NOT_FOUND', 'User not found')

    const tokens = this.generateTokens({
      sub: user.id,
      tenantId: user.tenantId ?? undefined,
      globalRole: user.globalRole as JwtPayload['globalRole'],
      tenantRole: user.tenantRole as JwtPayload['tenantRole'],
      email: user.email,
      authMethod: 'password',
    })

    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  async logout(userId: string) {
    await this.refreshTokenRepo.revokeAllByUser(userId)
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId, {
      id: true, email: true, name: true, globalRole: true, tenantRole: true, tenantId: true, lastLoginAt: true, createdAt: true,
    })
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found')

    // Super Admin profile — no tenant context
    if (user.globalRole === 'super_admin') {
      return { ...user, tenantName: null, tenantPlan: null, tenantCurrency: null, onboardingCompleted: false, featureFlags: [] }
    }

    const tenant = user.tenantId ? await this.tenantRepo.findById(user.tenantId, {
      name: true, subscriptionPlan: true, subscriptionStatus: true, settings: true, currency: true,
    }) : null

    const flags = user.tenantId ? await this.tenantRepo.getFeatureFlags(user.tenantId, { enabled: true }) : []

    return {
      ...user,
      tenantName: tenant?.name,
      tenantPlan: tenant?.subscriptionPlan,
      tenantCurrency: tenant?.currency,
      onboardingCompleted: (tenant?.settings as any)?.onboardingCompleted || false,
      featureFlags: flags.map(f => f.feature),
    }
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    if (data.email) {
      const existing = await this.userRepo.findFirst({
        where: { email: data.email, id: { not: userId } },
      })
      if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'Email already in use')
    }
    const user = await this.userRepo.update(userId, data, {
      id: true, email: true, name: true, globalRole: true, tenantRole: true,
    })
    return user
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found')

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new AppError(400, 'INVALID_PASSWORD', 'Current password is incorrect')

    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds)
    await this.userRepo.update(userId, { passwordHash })

    await this.refreshTokenRepo.revokeAllByUser(userId)

    return { message: 'Password changed successfully' }
  }

  private generateTokens(payload: JwtPayload): AuthTokens {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRATION,
    } as jwt.SignOptions)
    const refreshToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRATION,
    } as jwt.SignOptions)
    return { accessToken, refreshToken }
  }
}
