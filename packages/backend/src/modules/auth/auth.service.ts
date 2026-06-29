import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/database/prisma.js'
import { env } from '../../config/env.js'
import { AppError } from '../../common/filters/error-handler.js'
import { sendWelcomeEmail } from '../notifications/email.service.js'
import { SUBSCRIPTION_PLANS } from '@gastrocore/shared'
import type { JwtPayload, AuthTokens } from '@gastrocore/shared'

export class AuthService {
  private readonly saltRounds = 12

  async login(email: string, password: string) {
    const user = await prisma.user.findFirst({ where: { email } })
    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    }

    const tokens = this.generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    })

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { name: true, subscriptionPlan: true, subscriptionStatus: true, settings: true, currency: true },
    })

    const flags = await prisma.tenantFeatureFlag.findMany({
      where: { tenantId: user.tenantId, enabled: true },
      select: { feature: true },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), refreshToken: tokens.refreshToken },
    })

    const { passwordHash, refreshToken, ...safeUser } = user
    void passwordHash
    void refreshToken
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
    const existing = await prisma.user.findFirst({ where: { email: data.email } })
    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered')
    }

    // Auto-generate password if not provided
    const rawPassword = data.password || this.generatePassword()
    const passwordHash = await bcrypt.hash(rawPassword, this.saltRounds)

    const planId = (data.planId || 'basic') as keyof typeof SUBSCRIPTION_PLANS
    const plan = SUBSCRIPTION_PLANS[planId]

    const tenant = await prisma.tenant.create({
      data: {
        name: data.tenantName,
        slug: data.tenantName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        businessType: data.businessType as never,
        subscriptionPlan: planId,
        subscriptionStatus: 'trial',
      },
    })

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: data.email,
        passwordHash,
        name: data.name,
        role: 'admin',
      },
    })

    // Create subscription record if plan has features
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

      // Create feature flags from plan
      for (const feature of plan.features) {
        await prisma.tenantFeatureFlag.create({
          data: { tenantId: tenant.id, feature, enabled: true },
        })
      }
    }

    const tokens = this.generateTokens({
      sub: user.id,
      tenantId: tenant.id,
      role: user.role,
      email: user.email,
    })

    // Send welcome email with credentials (non-blocking)
    sendWelcomeEmail(data.email, data.name, data.email, rawPassword)
      .then((sent) => {
        if (sent) console.log(`[Auth] Welcome email sent to ${data.email}`)
        else console.warn(`[Auth] Could not send welcome email to ${data.email}`)
      })
      .catch((err) => console.warn(`[Auth] Email error for ${data.email}:`, err.message))

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      tenant,
      tokens,
      credentials: { email: data.email, password: rawPassword },
    }
  }

  private generatePassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'
    return Array.from(crypto.randomBytes(length), (byte) => chars[byte % chars.length]).join('')
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const user = await prisma.user.findFirst({ where: { refreshToken } })
    if (!user) throw new AppError(401, 'INVALID_REFRESH', 'Invalid refresh token')

    const tokens = this.generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    return tokens
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    })
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, tenantId: true, lastLoginAt: true, createdAt: true },
    })
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found')

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { name: true, subscriptionPlan: true, subscriptionStatus: true, settings: true, currency: true },
    })

    const flags = await prisma.tenantFeatureFlag.findMany({
      where: { tenantId: user.tenantId, enabled: true },
      select: { feature: true },
    })

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
      const existing = await prisma.user.findFirst({
        where: { email: data.email, id: { not: userId } },
      })
      if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'Email already in use')
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, role: true },
    })
    return user
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found')

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new AppError(400, 'INVALID_PASSWORD', 'Current password is incorrect')

    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds)
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })
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
