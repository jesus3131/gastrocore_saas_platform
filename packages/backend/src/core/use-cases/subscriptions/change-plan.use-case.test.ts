import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChangePlanUseCase } from './change-plan.use-case.js'

function makeSut() {
  const mockTenantRepo = {
    update: vi.fn(),
    getFeatureFlags: vi.fn(),
    upsertFeatureFlag: vi.fn(),
  }
  const mockSubscriptionRepo = {
    create: vi.fn(),
    createInvoice: vi.fn(),
  }
  const mockUow = {
    execute: vi.fn((fn: () => Promise<any>) => fn()),
  }

  const useCase = new ChangePlanUseCase(
    mockTenantRepo as any,
    mockSubscriptionRepo as any,
    mockUow as any,
  )

  return { useCase, mockTenantRepo, mockSubscriptionRepo, mockUow }
}

const mockSubscription = {
  id: 'sub-1',
  tenantId: 'tenant-1',
  plan: 'pro',
  status: 'active',
  currentPeriodStart: new Date('2026-01-01'),
  currentPeriodEnd: new Date('2026-02-01'),
}

describe('ChangePlanUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('execute', () => {
    it('changes plan to pro: updates tenant, creates subscription and invoice, refreshes feature flags', async () => {
      const { useCase, mockTenantRepo, mockSubscriptionRepo } = makeSut()
      mockTenantRepo.update.mockResolvedValue({ id: 'tenant-1', subscriptionPlan: 'pro' })
      mockSubscriptionRepo.create.mockResolvedValue(mockSubscription)
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })
      mockTenantRepo.getFeatureFlags.mockResolvedValue([
        { feature: 'pos', enabled: true },
        { feature: 'inventory', enabled: true },
      ])
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      const result = await useCase.execute('tenant-1', 'pro')

      // Tenant updated
      expect(mockTenantRepo.update).toHaveBeenCalledWith('tenant-1', { subscriptionPlan: 'pro' })

      // New subscription created
      expect(mockSubscriptionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        tenantId: 'tenant-1',
        plan: 'pro',
        status: 'active',
      }))

      // Invoice created
      expect(mockSubscriptionRepo.createInvoice).toHaveBeenCalledWith(expect.objectContaining({
        subscriptionId: 'sub-1',
        status: 'pending',
      }))

      // Old flags disabled
      expect(mockTenantRepo.upsertFeatureFlag).toHaveBeenCalledWith('tenant-1', 'pos', false)
      expect(mockTenantRepo.upsertFeatureFlag).toHaveBeenCalledWith('tenant-1', 'inventory', false)

      // New plan flags enabled
      expect(mockTenantRepo.upsertFeatureFlag).toHaveBeenCalledWith('tenant-1', expect.any(String), true)

      // Returns result
      expect(result.subscription).toBeDefined()
      expect(result.plan.id).toBe('pro')
    })

    it('changes plan to basic successfully', async () => {
      const { useCase, mockTenantRepo, mockSubscriptionRepo } = makeSut()
      mockTenantRepo.update.mockResolvedValue({ id: 'tenant-1', subscriptionPlan: 'basic' })
      mockSubscriptionRepo.create.mockResolvedValue({ ...mockSubscription, plan: 'basic' })
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })
      mockTenantRepo.getFeatureFlags.mockResolvedValue([])
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      const result = await useCase.execute('tenant-1', 'basic')

      expect(result.plan.id).toBe('basic')
    })

    it('changes plan to enterprise successfully', async () => {
      const { useCase, mockTenantRepo, mockSubscriptionRepo } = makeSut()
      mockTenantRepo.update.mockResolvedValue({ id: 'tenant-1', subscriptionPlan: 'enterprise' })
      mockSubscriptionRepo.create.mockResolvedValue({ ...mockSubscription, plan: 'enterprise' })
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })
      mockTenantRepo.getFeatureFlags.mockResolvedValue([])
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      const result = await useCase.execute('tenant-1', 'enterprise')

      expect(result.plan.id).toBe('enterprise')
    })

    it('throws 400 for invalid plan name', async () => {
      const { useCase } = makeSut()

      await expect(useCase.execute('tenant-1', 'diamond'))
        .rejects.toMatchObject({ statusCode: 400, code: 'INVALID_PLAN' })
    })

    it('throws 400 for empty plan string', async () => {
      const { useCase } = makeSut()

      await expect(useCase.execute('tenant-1', ''))
        .rejects.toMatchObject({ statusCode: 400, code: 'INVALID_PLAN' })
    })

    it('executes inside unit of work', async () => {
      const { useCase, mockTenantRepo, mockSubscriptionRepo, mockUow } = makeSut()
      mockTenantRepo.update.mockResolvedValue({ id: 'tenant-1', subscriptionPlan: 'pro' })
      mockSubscriptionRepo.create.mockResolvedValue(mockSubscription)
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })
      mockTenantRepo.getFeatureFlags.mockResolvedValue([])
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      await useCase.execute('tenant-1', 'pro')

      expect(mockUow.execute).toHaveBeenCalledOnce()
    })

    it('disables all old flags before enabling new plan flags', async () => {
      const { useCase, mockTenantRepo, mockSubscriptionRepo } = makeSut()
      mockTenantRepo.update.mockResolvedValue({ id: 'tenant-1', subscriptionPlan: 'basic' })
      mockSubscriptionRepo.create.mockResolvedValue({ ...mockSubscription, plan: 'basic' })
      mockSubscriptionRepo.createInvoice.mockResolvedValue({ id: 'inv-1' })

      // Tenant previously had pro features
      const oldFlags = [
        { feature: 'advanced_analytics', enabled: true },
        { feature: 'multi_branch', enabled: true },
      ]
      mockTenantRepo.getFeatureFlags.mockResolvedValue(oldFlags)
      mockTenantRepo.upsertFeatureFlag.mockResolvedValue(undefined)

      await useCase.execute('tenant-1', 'basic')

      // Old pro features should be disabled
      expect(mockTenantRepo.upsertFeatureFlag).toHaveBeenCalledWith('tenant-1', 'advanced_analytics', false)
      expect(mockTenantRepo.upsertFeatureFlag).toHaveBeenCalledWith('tenant-1', 'multi_branch', false)
    })
  })
})
