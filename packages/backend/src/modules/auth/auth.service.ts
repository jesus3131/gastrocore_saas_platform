import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/database/prisma.js'
import { env } from '../../config/env.js'
import { AppError } from '../../common/filters/error-handler.js'
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

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), refreshToken: tokens.refreshToken },
    })

    const { passwordHash, refreshToken, ...safeUser } = user
    void passwordHash
    void refreshToken
    return { user: safeUser, tokens }
  }

  async register(data: {
    email: string
    password: string
    name: string
    tenantName: string
    businessType: string
  }) {
    const existing = await prisma.user.findFirst({ where: { email: data.email } })
    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered')
    }

    const passwordHash = await bcrypt.hash(data.password, this.saltRounds)

    const tenant = await prisma.tenant.create({
      data: {
        name: data.tenantName,
        slug: data.tenantName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        businessType: data.businessType as never,
        subscriptionPlan: 'basic',
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

    const tokens = this.generateTokens({
      sub: user.id,
      tenantId: tenant.id,
      role: user.role,
      email: user.email,
    })

    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, tenant, tokens }
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
      select: { id: true, email: true, name: true, role: true, tenantId: true, lastLoginAt: true },
    })
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
    return user
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
