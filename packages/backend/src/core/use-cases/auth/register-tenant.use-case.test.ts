import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(() => '$2b$12$hashedpassword'),
  },
}))

import { RegisterTenantUseCase } from './register-tenant.use-case.js'

function makeSut() {
  const mockUserRepo = {
    findByEmail: vi.fn(),
    create: vi.fn(),
  }
  const mockTenantRepo = {
    create: vi.fn(),
    upsertFeatureFlag: vi.fn(),
  }
  const mockEmployeeRepo = {
    create: vi.fn(),
  }
  const mockSubscriptionRepo = {
    create: vi.fn(),
    createInvoice: vi.fn(),
  }
  const mockUow = {
    execute: vi.fn((fn: () => Promise<any>) => fn()),
  }

  const useCase = new RegisterTenantUseCase(
    mockUserRepo as any,
    mockTenantRepo as any,
    mockEmployeeRepo as any,
    mockSubscriptionRepo as any,
    mockUow as any,
  )

  return { useCase, mockUserRepo, mockTenantRepo, mockEmployeeRepo, mockSubscriptionRepo, mockUow }
}

const validInput = {
  email: 'admin@lacocina.com',
  name: 'María García',
  tenantName: 'La Cocina',
  businessType: 'restaurant',
  planId: 'basic',
}

const mockTenant = {
  id: 'tenant-1',
  name: 'La Cocina',
  subscriptionPlan: 'basic',
  subscriptionStatus: 'trial',
}

const mockEmployee = {
  id: 'emp-1',
  tenantId: 'tenant-1',
  name: 'María García',
  email: 'admin@lacocina.com',
  role: 'admin',
}

const mockUser = {
  id: 'user-1',
  tenantId: 'tenant-1',
  email: 'admin@lacocina.com',
  name: 'María García',
  tenantRole: 'admin',
  globalRole: null,
}

describe('RegisterTenantUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('execute', () => {
    it('registers tenant, employee, user and subscription with basic plan', async () => {
      const { useCase, mockUserRepo, mockTenantRepo, mockEmployeeRepo, mockSubscriptionRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(null)
      mockTenantRepo.create.mockResolvedValue(mockTenant)
      mockEmployeeRepo.create.mockResolvedValue(mockEmployee)
      mockUserRepo.create.mockResolvedValue(mockUser)
      mockSubscriptionRepo.create.mockResolvedValue({
        id: 'sub-1',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      const result = await useCase.execute(validInput)

      // Tenant created
      expect(mockTenantRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'La Cocina',
        businessType: 'restaurant',
        subscriptionPlan: 'basic',
        subscriptionStatus: 'trial',
      }))

      // Employee created in tenant
      expect(mockEmployeeRepo.create).toHaveBeenCalledWith('tenant-1', expect.objectContaining({
        name: 'María García',
        email: 'admin@lacocina.com',
        role: 'admin',
      }))

      // User linked to employee
      expect(mockUserRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        email: 'admin@lacocina.com',
        tenantRole: 'admin',
      }))

      // Subscription created
      expect(mockSubscriptionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        tenantId: 'tenant-1',
        plan: 'basic',
        status: 'trial',
      }))

      // Invoice created
      expect(mockSubscriptionRepo.createInvoice).toHaveBeenCalled()

      // Feature flags set
      expect(mockTenantRepo.upsertFeatureFlag).toHaveBeenCalled()

      // Returns correct structure
      expect(result.user.email).toBe('admin@lacocina.com')
      expect(result.tenant.id).toBe('tenant-1')
      expect(result.credentials.email).toBe('admin@lacocina.com')
      expect(typeof result.credentials.password).toBe('string')
      expect(result.credentials.password.length).toBeGreaterThan(0)
    })

    it('throws 409 when email already registered', async () => {
      const { useCase, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing', email: 'admin@lacocina.com' })

      await expect(useCase.execute(validInput))
        .rejects.toMatchObject({ statusCode: 409, code: 'EMAIL_EXISTS' })
    })

    it('generates a random password when none provided', async () => {
      const { useCase, mockUserRepo, mockTenantRepo, mockEmployeeRepo, mockSubscriptionRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(null)
      mockTenantRepo.create.mockResolvedValue(mockTenant)
      mockEmployeeRepo.create.mockResolvedValue(mockEmployee)
      mockUserRepo.create.mockResolvedValue(mockUser)
      mockSubscriptionRepo.create.mockResolvedValue({
        id: 'sub-1',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
      })
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      const result = await useCase.execute({ ...validInput, password: undefined })

      // Password auto-generated and returned in credentials
      expect(result.credentials.password).toBeTruthy()
      expect(result.credentials.password.length).toBeGreaterThanOrEqual(12)
    })

    it('uses provided password when given', async () => {
      const { useCase, mockUserRepo, mockTenantRepo, mockEmployeeRepo, mockSubscriptionRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(null)
      mockTenantRepo.create.mockResolvedValue(mockTenant)
      mockEmployeeRepo.create.mockResolvedValue(mockEmployee)
      mockUserRepo.create.mockResolvedValue(mockUser)
      mockSubscriptionRepo.create.mockResolvedValue({
        id: 'sub-1',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
      })
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      const result = await useCase.execute({ ...validInput, password: 'MyPassword123!' })

      expect(result.credentials.password).toBe('MyPassword123!')
    })

    it('executes inside unit of work', async () => {
      const { useCase, mockUserRepo, mockTenantRepo, mockEmployeeRepo, mockSubscriptionRepo, mockUow } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(null)
      mockTenantRepo.create.mockResolvedValue(mockTenant)
      mockEmployeeRepo.create.mockResolvedValue(mockEmployee)
      mockUserRepo.create.mockResolvedValue(mockUser)
      mockSubscriptionRepo.create.mockResolvedValue({
        id: 'sub-1',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
      })
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      await useCase.execute(validInput)

      expect(mockUow.execute).toHaveBeenCalledOnce()
    })
  })
})
