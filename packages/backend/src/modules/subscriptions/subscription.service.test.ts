import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SubscriptionService } from './subscription.service.js'
import { AppError } from '../../common/filters/error-handler.js'

vi.mock('../notifications/email.service.js', () => ({
  sendCredentialsEmail: vi.fn(() => Promise.resolve(true)),
}))

function makeSut(changePlanUseCaseMock?: any) {
  const mockSubscriptionRepo = {
    findFirst: vi.fn(),
    create: vi.fn(),
    createInvoice: vi.fn(),
    findInvoices: vi.fn(),
  }
  const mockTenantRepo = {
    findById: vi.fn(),
    update: vi.fn(),
    deleteFeatureFlags: vi.fn(),
    upsertFeatureFlag: vi.fn(),
    findManyAdmins: vi.fn(),
  }

  const service = new SubscriptionService(
    mockSubscriptionRepo as any,
    mockTenantRepo as any,
    changePlanUseCaseMock,
  )

  return { service, mockSubscriptionRepo, mockTenantRepo }
}

const mockTenant = {
  id: 'tenant-1',
  name: 'La Cocina',
  subscriptionPlan: 'pro',
  subscriptionStatus: 'active',
  customFields: { extraUsers: 2 },
  currency: 'MXN',
}

const mockSubscription = {
  id: 'sub-1',
  tenantId: 'tenant-1',
  plan: 'pro',
  status: 'active',
  currentPeriodStart: new Date('2026-01-01'),
  currentPeriodEnd: new Date('2026-02-01'),
  invoices: [],
}

describe('SubscriptionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPlans', () => {
    it('returns all subscription plans as array', async () => {
      const { service } = makeSut()

      const result = await service.getPlans()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      const plans = result.map((p: any) => p.id)
      expect(plans).toContain('basic')
      expect(plans).toContain('pro')
    })
  })

  describe('getCurrentSubscription', () => {
    it('returns subscription with plan info and extraUsers', async () => {
      const { service, mockSubscriptionRepo, mockTenantRepo } = makeSut()
      mockSubscriptionRepo.findFirst.mockResolvedValue(mockSubscription)
      mockTenantRepo.findById.mockResolvedValue(mockTenant)

      const result = await service.getCurrentSubscription('tenant-1')

      expect(mockSubscriptionRepo.findFirst).toHaveBeenCalledWith(
        { tenantId: 'tenant-1' },
        expect.objectContaining({ invoices: expect.any(Object) }),
      )
      expect(mockTenantRepo.findById).toHaveBeenCalledWith('tenant-1', expect.any(Object))
      expect(result.subscription).toEqual(mockSubscription)
      expect(result.extraUsers).toBe(2)
      expect(result.currentPlan?.subscriptionPlan).toBe('pro')
    })

    it('returns plan as null when tenant has no plan', async () => {
      const { service, mockSubscriptionRepo, mockTenantRepo } = makeSut()
      mockSubscriptionRepo.findFirst.mockResolvedValue(null)
      mockTenantRepo.findById.mockResolvedValue({ ...mockTenant, subscriptionPlan: 'unknown_plan' })

      const result = await service.getCurrentSubscription('tenant-1')

      expect(result.plan).toBeNull()
    })
  })

  describe('changePlan', () => {
    it('delegates to ChangePlanUseCase when provided', async () => {
      const mockUseCase = { execute: vi.fn().mockResolvedValue({ subscription: mockSubscription, plan: { id: 'pro' } }) }
      const { service } = makeSut(mockUseCase)

      const result = await service.changePlan('tenant-1', 'pro')

      expect(mockUseCase.execute).toHaveBeenCalledWith('tenant-1', 'pro')
      expect(result).toBeDefined()
    })

    it('throws 400 when plan is invalid (no use case)', async () => {
      const { service } = makeSut()

      await expect(service.changePlan('tenant-1', 'diamond'))
        .rejects.toMatchObject({ statusCode: 400, code: 'INVALID_PLAN' })
    })

    it('changes plan directly via repo when no use case', async () => {
      const { service, mockSubscriptionRepo, mockTenantRepo } = makeSut()
      mockTenantRepo.update.mockResolvedValue({ ...mockTenant, subscriptionPlan: 'basic' })
      mockSubscriptionRepo.create.mockResolvedValue({ ...mockSubscription, plan: 'basic', id: 'sub-2' })
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })
      mockTenantRepo.deleteFeatureFlags.mockResolvedValue(undefined)
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)
      mockTenantRepo.findManyAdmins.mockResolvedValue([])

      const result = await service.changePlan('tenant-1', 'basic')

      expect(mockTenantRepo.update).toHaveBeenCalledWith('tenant-1', { subscriptionPlan: 'basic' })
      expect(mockSubscriptionRepo.create).toHaveBeenCalled()
      expect(mockSubscriptionRepo.createInvoice).toHaveBeenCalled()
      expect(result.plan).toBeDefined()
    })

    it('notifyPlanChange only logs, does not send invalid emails', async () => {
      const { service, mockSubscriptionRepo, mockTenantRepo } = makeSut()
      mockTenantRepo.update.mockResolvedValue(mockTenant)
      mockSubscriptionRepo.create.mockResolvedValue(mockSubscription)
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })
      mockTenantRepo.deleteFeatureFlags.mockResolvedValue(undefined)
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)
      const admins = [{ email: 'admin@test.com', name: 'Admin' }]
      mockTenantRepo.findManyAdmins.mockResolvedValue(admins)

      // Should complete without throwing (notifyPlanChange is fire-and-forget)
      await expect(service.changePlan('tenant-1', 'basic')).resolves.toBeDefined()
    })
  })

  describe('getInvoices', () => {
    it('returns invoices from repository', async () => {
      const { service, mockSubscriptionRepo } = makeSut()
      const invoices = [{ id: 'inv-1', amount: 299, status: 'paid' }]
      mockSubscriptionRepo.findInvoices.mockResolvedValue(invoices)

      const result = await service.getInvoices('tenant-1')

      expect(mockSubscriptionRepo.findInvoices).toHaveBeenCalledWith('tenant-1')
      expect(result).toEqual(invoices)
    })
  })
})
