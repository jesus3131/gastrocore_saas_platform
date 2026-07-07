import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError } from '../../common/filters/error-handler.js'

vi.mock('bcrypt', () => ({
  default: { hash: vi.fn(() => '$2b$12$newhash'), compare: vi.fn() },
}))

vi.mock('../notifications/email.service.js', () => ({
  sendWelcomeEmail: vi.fn(() => Promise.resolve(true)),
}))

import { SuperAdminService } from './super-admin.service.js'

function makeSut(createCompanyUseCaseMock?: any) {
  const mockTenantRepo = {
    findById: vi.fn(),
    findManyTenants: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteFeatureFlags: vi.fn(),
    upsertFeatureFlag: vi.fn(),
    findUsersByTenant: vi.fn(),
    updateAdminPassword: vi.fn(),
    findManyAdmins: vi.fn(),
    getFeatureFlags: vi.fn(),
  }
  const mockUserRepo = {
    findByEmail: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
  }
  const mockSubscriptionRepo = {
    create: vi.fn(),
    createInvoice: vi.fn(),
  }

  const service = new SuperAdminService(
    mockTenantRepo as any,
    mockUserRepo as any,
    mockSubscriptionRepo as any,
    createCompanyUseCaseMock,
  )

  return { service, mockTenantRepo, mockUserRepo, mockSubscriptionRepo }
}

const mockTenant = {
  id: 'tenant-1',
  name: 'La Cocina',
  businessType: 'restaurant',
  subscriptionPlan: 'pro',
  subscriptionStatus: 'active',
  customFields: { taxId: 'RFC123', extraUsers: 0 },
  locale: 'es-MX',
  timezone: 'America/Mexico_City',
  currency: 'MXN',
  createdAt: new Date(),
}

describe('SuperAdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCompany', () => {
    it('delegates to CreateCompanyUseCase when provided', async () => {
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          company: { id: 'tenant-new', name: 'Nuevo Restaurante' },
          admin: { id: 'user-new', email: 'admin@nuevo.com', name: 'Admin' },
          credentials: { email: 'admin@nuevo.com', password: 'SecurePass123!' },
        }),
      }
      const { service } = makeSut(mockUseCase)

      const result = await service.createCompany({
        companyName: 'Nuevo Restaurante',
        adminName: 'Admin',
        adminEmail: 'admin@nuevo.com',
        businessType: 'restaurant',
        planId: 'basic',
      })

      expect(mockUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
        companyName: 'Nuevo Restaurante',
        adminEmail: 'admin@nuevo.com',
      }))
      expect(result.company.name).toBe('Nuevo Restaurante')
      expect(result.credentials.password).toBe('SecurePass123!')
    })

    it('throws 409 when email already exists (no use case)', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findFirst.mockResolvedValue({ id: 'existing-user', email: 'admin@nuevo.com' })

      await expect(service.createCompany({
        companyName: 'Restaurante',
        adminName: 'Admin',
        adminEmail: 'admin@nuevo.com',
        businessType: 'restaurant',
        planId: 'basic',
      })).rejects.toMatchObject({ statusCode: 409, code: 'EMAIL_EXISTS' })
    })
  })

  describe('updateCompany', () => {
    it('updates company name and custom fields', async () => {
      const { service, mockTenantRepo } = makeSut()
      mockTenantRepo.findById.mockResolvedValue(mockTenant)
      mockTenantRepo.update.mockResolvedValue({
        ...mockTenant,
        name: 'La Cocina Actualizada',
        customFields: { taxId: 'RFC999', extraUsers: 5 },
      })

      const result = await service.updateCompany('tenant-1', {
        companyName: 'La Cocina Actualizada',
        taxId: 'RFC999',
        extraUsers: 5,
      })

      expect(mockTenantRepo.findById).toHaveBeenCalledWith('tenant-1')
      expect(mockTenantRepo.update).toHaveBeenCalledWith(
        'tenant-1',
        expect.objectContaining({ name: 'La Cocina Actualizada' }),
      )
      expect(result.name).toBe('La Cocina Actualizada')
    })

    it('throws 404 when company not found', async () => {
      const { service, mockTenantRepo } = makeSut()
      mockTenantRepo.findById.mockResolvedValue(null)

      await expect(service.updateCompany('bad-id', { companyName: 'Test' }))
        .rejects.toMatchObject({ statusCode: 404, code: 'COMPANY_NOT_FOUND' })
    })
  })

  describe('toggleTenantStatus', () => {
    it('suspends an active tenant', async () => {
      const { service, mockTenantRepo } = makeSut()
      mockTenantRepo.findById.mockResolvedValue({ ...mockTenant, subscriptionStatus: 'active' })
      mockTenantRepo.update.mockResolvedValue({ ...mockTenant, subscriptionStatus: 'suspended' })

      const result = await service.toggleTenantStatus('tenant-1')

      expect(mockTenantRepo.update).toHaveBeenCalledWith('tenant-1', { subscriptionStatus: 'suspended' })
      expect(result.status).toBe('suspended')
    })

    it('activates a suspended tenant', async () => {
      const { service, mockTenantRepo } = makeSut()
      mockTenantRepo.findById.mockResolvedValue({ ...mockTenant, subscriptionStatus: 'suspended' })
      mockTenantRepo.update.mockResolvedValue({ ...mockTenant, subscriptionStatus: 'active' })

      const result = await service.toggleTenantStatus('tenant-1')

      expect(mockTenantRepo.update).toHaveBeenCalledWith('tenant-1', { subscriptionStatus: 'active' })
      expect(result.status).toBe('active')
    })

    it('throws 404 when company not found', async () => {
      const { service, mockTenantRepo } = makeSut()
      mockTenantRepo.findById.mockResolvedValue(null)

      await expect(service.toggleTenantStatus('bad-id'))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('migratePlan', () => {
    it('migrates tenant to a valid new plan', async () => {
      const { service, mockTenantRepo, mockSubscriptionRepo } = makeSut()
      mockTenantRepo.findById.mockResolvedValue(mockTenant)
      mockTenantRepo.update.mockResolvedValue({ ...mockTenant, subscriptionPlan: 'enterprise' })
      mockSubscriptionRepo.create.mockResolvedValue({ id: 'sub-new', plan: 'enterprise' })
      mockTenantRepo.deleteFeatureFlags.mockResolvedValue(undefined)
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      const result = await service.migratePlan('tenant-1', 'enterprise')

      expect(mockTenantRepo.update).toHaveBeenCalledWith('tenant-1', { subscriptionPlan: 'enterprise' })
      expect(mockSubscriptionRepo.create).toHaveBeenCalled()
      expect(result.subscriptionPlan).toBe('enterprise')
    })

    it('throws 400 for invalid plan', async () => {
      const { service, mockTenantRepo } = makeSut()
      mockTenantRepo.findById.mockResolvedValue(mockTenant)

      await expect(service.migratePlan('tenant-1', 'diamond'))
        .rejects.toMatchObject({ statusCode: 400, code: 'INVALID_PLAN' })
    })

    it('throws 404 when company not found', async () => {
      const { service, mockTenantRepo } = makeSut()
      mockTenantRepo.findById.mockResolvedValue(null)

      await expect(service.migratePlan('bad-id', 'pro'))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('updateModules', () => {
    it('upserts feature flags for each feature', async () => {
      const { service, mockTenantRepo } = makeSut()
      mockTenantRepo.findById.mockResolvedValue(mockTenant)
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      const features = [
        { feature: 'pos', enabled: true },
        { feature: 'analytics', enabled: false },
      ]

      const result = await service.updateModules('tenant-1', features)

      expect(mockTenantRepo.upsertFeatureFlag).toHaveBeenCalledTimes(2)
      expect(mockTenantRepo.upsertFeatureFlag).toHaveBeenCalledWith('tenant-1', 'pos', true)
      expect(mockTenantRepo.upsertFeatureFlag).toHaveBeenCalledWith('tenant-1', 'analytics', false)
      expect(result.message).toBe('Modules updated successfully')
    })

    it('throws 404 when company not found', async () => {
      const { service, mockTenantRepo } = makeSut()
      mockTenantRepo.findById.mockResolvedValue(null)

      await expect(service.updateModules('bad-id', [{ feature: 'pos', enabled: true }]))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('resendCredentials', () => {
    it('resets password and sends email to admin', async () => {
      const { service, mockTenantRepo } = makeSut()
      const admin = { id: 'admin-1', email: 'admin@lacocina.com', name: 'Admin' }
      mockTenantRepo.findUsersByTenant.mockResolvedValue([admin])
      mockTenantRepo.updateAdminPassword.mockResolvedValue(undefined)

      const result = await service.resendCredentials('tenant-1')

      expect(mockTenantRepo.findUsersByTenant).toHaveBeenCalledWith('tenant-1', { tenantRole: 'admin', isActive: true })
      expect(mockTenantRepo.updateAdminPassword).toHaveBeenCalledWith('admin-1', expect.any(String))
      expect(result.email).toBe('admin@lacocina.com')
      expect(result.message).toBe('Credentials re-sent successfully')
    })

    it('throws 404 when no active admin found', async () => {
      const { service, mockTenantRepo } = makeSut()
      mockTenantRepo.findUsersByTenant.mockResolvedValue([])

      await expect(service.resendCredentials('tenant-1'))
        .rejects.toMatchObject({ statusCode: 404, code: 'ADMIN_NOT_FOUND' })
    })
  })

  describe('getPlans', () => {
    it('returns all plans with feature labels', async () => {
      const { service } = makeSut()

      const result = await service.getPlans()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('priceMonthly')
      expect(result[0]).toHaveProperty('features')
      expect(Array.isArray(result[0].features)).toBe(true)
    })
  })
})
