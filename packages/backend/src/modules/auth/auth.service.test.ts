import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from './auth.service.js'
import { AppError } from '../../common/filters/error-handler.js'

vi.mock('bcrypt', () => ({ default: { compare: vi.fn(), hash: vi.fn() } }))
vi.mock('jsonwebtoken', () => ({ default: { sign: vi.fn(() => 'mock-token') } }))
vi.mock('../notifications/email.service.js', () => ({ sendWelcomeEmail: vi.fn(() => Promise.resolve(true)) }))

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

function makeSut(registerTenantMock?: any) {
  const mockUserRepo = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  }
  const mockTenantRepo = {
    findById: vi.fn(),
    create: vi.fn(),
    getFeatureFlags: vi.fn(),
    upsertFeatureFlag: vi.fn(),
  }
  const mockSubscriptionRepo = {
    create: vi.fn(),
    createInvoice: vi.fn(),
  }
  const mockRefreshTokenRepo = {
    create: vi.fn(),
    findValid: vi.fn(),
    revoke: vi.fn(),
    revokeAllByUser: vi.fn(),
  }

  const service = new AuthService(
    mockUserRepo as any,
    mockTenantRepo as any,
    mockSubscriptionRepo as any,
    mockRefreshTokenRepo as any,
    registerTenantMock,
  )

  return { service, mockUserRepo, mockTenantRepo, mockSubscriptionRepo, mockRefreshTokenRepo }
}

const mockUser = {
  id: 'user-1',
  tenantId: 'tenant-1',
  email: 'admin@test.com',
  name: 'Admin',
  globalRole: null,
  tenantRole: 'admin',
  passwordHash: '$2b$12$hashed',
  isActive: true,
  employeeId: 'emp-1',
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockTenant = {
  id: 'tenant-1',
  name: 'Test Restaurant',
  subscriptionPlan: 'pro',
  subscriptionStatus: 'active',
  settings: { onboardingCompleted: true },
  currency: 'MXN',
}

describe('AuthService', () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe('superAdminLogin', () => {
    it('returns tokens and user when credentials are valid', async () => {
      const { service, mockUserRepo } = makeSut()
      const saUser = { ...mockUser, tenantId: null, globalRole: 'super_admin', tenantRole: null }
      mockUserRepo.findByEmail.mockResolvedValue(saUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      mockUserRepo.update.mockResolvedValue(saUser)

      const result = await service.superAdminLogin('super@admin.com', 'pass123')

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('super@admin.com')
      expect(bcrypt.compare).toHaveBeenCalledWith('pass123', saUser.passwordHash)
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1', globalRole: 'super_admin' }),
        expect.any(String), expect.any(Object),
      )
      expect(result.user.isSuperAdmin).toBe(true)
      expect(result.tokens.accessToken).toBe('mock-token')
    })

    it('throws 401 when user not found', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(null)

      await expect(service.superAdminLogin('bad@email.com', 'pass')).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 401 when user is not super_admin', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(mockUser)

      await expect(service.superAdminLogin('admin@test.com', 'pass')).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 401 when password is wrong', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, tenantId: null, globalRole: 'super_admin' })
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(service.superAdminLogin('super@admin.com', 'wrong')).rejects.toMatchObject({ statusCode: 401 })
    })
  })

  describe('login', () => {
    it('returns tokens and user with tenant info', async () => {
      const { service, mockUserRepo, mockTenantRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      mockTenantRepo.findById.mockResolvedValue(mockTenant)
      mockTenantRepo.getFeatureFlags.mockResolvedValue([{ feature: 'pos' }, { feature: 'analytics' }])
      mockUserRepo.update.mockResolvedValue(mockUser)

      const result = await service.login('admin@test.com', 'pass123')

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('admin@test.com', undefined)
      expect(bcrypt.compare).toHaveBeenCalledWith('pass123', mockUser.passwordHash)
      expect(mockTenantRepo.findById).toHaveBeenCalledWith('tenant-1', expect.any(Object))
      expect(result.user.tenantName).toBe('Test Restaurant')
      expect(result.user.featureFlags).toEqual(['pos', 'analytics'])
      expect(result.tokens.accessToken).toBe('mock-token')
    })

    it('throws 401 when user not found', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(null)

      await expect(service.login('bad@email.com', 'pass')).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 401 when user is inactive', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, isActive: false })

      await expect(service.login('admin@test.com', 'pass')).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 401 when user has no tenantId (super admin)', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, tenantId: null })

      await expect(service.login('super@admin.com', 'pass')).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 401 when password is wrong', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(service.login('admin@test.com', 'wrong')).rejects.toMatchObject({ statusCode: 401 })
    })
  })

  describe('refresh', () => {
    it('returns new tokens when refresh token is valid', async () => {
      const { service, mockRefreshTokenRepo, mockUserRepo } = makeSut()
      mockRefreshTokenRepo.findValid.mockResolvedValue({ id: 'rt-1', userId: 'user-1', expiresAt: new Date(Date.now() + 86400000) })
      mockUserRepo.findById.mockResolvedValue(mockUser)

      const result = await service.refresh('valid-refresh-token')

      expect(mockRefreshTokenRepo.revoke).toHaveBeenCalledWith('rt-1')
      expect(mockRefreshTokenRepo.create).toHaveBeenCalled()
      expect(jwt.sign).toHaveBeenCalled()
      expect(result.accessToken).toBe('mock-token')
    })

    it('throws 401 when refresh token is invalid', async () => {
      const { service, mockRefreshTokenRepo } = makeSut()
      mockRefreshTokenRepo.findValid.mockResolvedValue(null)

      await expect(service.refresh('bad-token')).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 401 when user not found', async () => {
      const { service, mockRefreshTokenRepo, mockUserRepo } = makeSut()
      mockRefreshTokenRepo.findValid.mockResolvedValue({ id: 'rt-1', userId: 'user-1', expiresAt: new Date(Date.now() + 86400000) })
      mockUserRepo.findById.mockResolvedValue(null)

      await expect(service.refresh('valid-token')).rejects.toMatchObject({ statusCode: 401 })
    })
  })

  describe('getProfile', () => {
    it('returns user profile with tenant info', async () => {
      const { service, mockUserRepo, mockTenantRepo } = makeSut()
      mockUserRepo.findById.mockResolvedValue(mockUser)
      mockTenantRepo.findById.mockResolvedValue(mockTenant)
      mockTenantRepo.getFeatureFlags.mockResolvedValue([{ feature: 'pos' }])

      const result = await service.getProfile('user-1')

      expect(result.tenantName).toBe('Test Restaurant')
      expect(result.featureFlags).toEqual(['pos'])
    })

    it('returns super admin profile without tenant context', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findById.mockResolvedValue({ ...mockUser, tenantId: null, globalRole: 'super_admin' })

      const result = await service.getProfile('user-1') as any

      expect(result.isSuperAdmin).toBe(true)
      expect(result.tenantName).toBeNull()
    })

    it('throws 404 when user not found', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findById.mockResolvedValue(null)

      await expect(service.getProfile('bad-id')).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('updateProfile', () => {
    it('updates user name and email', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findFirst.mockResolvedValue(null)
      mockUserRepo.update.mockResolvedValue({ ...mockUser, name: 'New Name' })

      const result = await service.updateProfile('user-1', { name: 'New Name', email: 'new@email.com' })

      expect(mockUserRepo.findFirst).toHaveBeenCalledWith({ where: { email: 'new@email.com', id: { not: 'user-1' } } })
      expect(mockUserRepo.update).toHaveBeenCalledWith('user-1', { name: 'New Name', email: 'new@email.com' }, expect.any(Object))
      expect(result.name).toBe('New Name')
    })

    it('throws 409 when email is taken', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findFirst.mockResolvedValue({ id: 'other-user', email: 'taken@email.com' })

      await expect(service.updateProfile('user-1', { email: 'taken@email.com' })).rejects.toMatchObject({ statusCode: 409 })
    })
  })

  describe('register', () => {
    it('uses RegisterTenantUseCase when provided', async () => {
      const registerUseCase = { execute: vi.fn() }
      const { service } = makeSut(registerUseCase)
      registerUseCase.execute.mockResolvedValue({
        user: { id: 'user-new', email: 'new@test.com', name: 'New User', globalRole: null, tenantRole: 'admin' },
        tenant: { id: 'tenant-new', name: 'New Restaurant' },
        credentials: { email: 'new@test.com', password: 'generated-pass' },
      })

      const result = await service.register({
        email: 'new@test.com', name: 'New User', tenantName: 'New Restaurant', businessType: 'restaurant',
      })

      expect(registerUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new@test.com', tenantName: 'New Restaurant', businessType: 'restaurant',
      }))
      expect(result.user.email).toBe('new@test.com')
      expect(result.credentials.password).toBe('generated-pass')
      expect(result.tokens.accessToken).toBe('mock-token')
    })

    it('throws 400 when tenantName is missing', async () => {
      const { service } = makeSut()

      await expect(service.register({
        email: 'new@test.com', name: 'New User', tenantName: '', businessType: 'restaurant',
      })).rejects.toMatchObject({ statusCode: 400 })
    })
  })

  describe('logout', () => {
    it('revokes all refresh tokens for the user', async () => {
      const { service, mockRefreshTokenRepo } = makeSut()

      await service.logout('user-1')

      expect(mockRefreshTokenRepo.revokeAllByUser).toHaveBeenCalledWith('user-1')
    })
  })

  describe('changePassword', () => {
    it('changes password and revokes all refresh tokens', async () => {
      const { service, mockUserRepo, mockRefreshTokenRepo } = makeSut()
      mockUserRepo.findById.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(bcrypt.hash).mockResolvedValue('$2b$12$newhash' as never)
      mockUserRepo.update.mockResolvedValue(mockUser)

      const result = await service.changePassword('user-1', 'current-pass', 'new-pass')

      expect(bcrypt.compare).toHaveBeenCalledWith('current-pass', mockUser.passwordHash)
      expect(bcrypt.hash).toHaveBeenCalledWith('new-pass', 12)
      expect(mockUserRepo.update).toHaveBeenCalledWith('user-1', { passwordHash: '$2b$12$newhash' })
      expect(mockRefreshTokenRepo.revokeAllByUser).toHaveBeenCalledWith('user-1')
      expect(result.message).toBe('Password changed successfully')
    })

    it('throws 404 when user not found', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findById.mockResolvedValue(null)

      await expect(service.changePassword('bad-id', 'pass', 'new-pass')).rejects.toMatchObject({ statusCode: 404 })
    })

    it('throws 400 when current password is wrong', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findById.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(service.changePassword('user-1', 'wrong', 'new-pass')).rejects.toMatchObject({ statusCode: 400 })
    })
  })
})
