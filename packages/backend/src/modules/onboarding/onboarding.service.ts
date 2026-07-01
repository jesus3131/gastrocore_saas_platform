import { inject, injectable } from 'tsyringe'
import { BUSINESS_TYPE_FEATURES } from '@gastrocore/shared'
import type { BusinessType } from '@gastrocore/shared'
import { CompleteOnboardingUseCase } from '../../core/use-cases/onboarding/complete-onboarding.use-case.js'
import type { TenantRepository } from '../../core/ports/repositories/tenant.repository.js'

@injectable()
export class OnboardingService {
  constructor(
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
    private readonly completeOnboardingUseCase?: CompleteOnboardingUseCase,
  ) {}

  // Step 1: Business Profile
  async saveProfile(tenantId: string, data: { name: string; businessType: string; locale: string; timezone: string; currency: string }) {
    const current = await this.tenantRepo.findById(tenantId)
    const tenant = await this.tenantRepo.update(tenantId, {
      name: data.name,
      businessType: data.businessType as any,
      locale: data.locale,
      timezone: data.timezone,
      currency: data.currency,
      settings: {
        ...((current?.settings || {}) as any),
        onboardingStep: 'areas',
      },
    })

    const defaultFeatures = BUSINESS_TYPE_FEATURES[data.businessType as BusinessType] || []
    for (const feature of defaultFeatures) {
      await this.tenantRepo.upsertFeatureFlag(tenantId, feature, true)
    }

    return tenant
  }

  // Step 2: Areas & Tables
  async saveAreas(tenantId: string, data: { branches: { name: string; areas: { name: string; type: string; tables: { label: string; capacity: number }[] }[] }[] }) {
    for (const branchData of data.branches) {
      const branch = await this.tenantRepo.createBranch({
        tenantId, name: branchData.name, settings: { onboardingStep: 'modules' },
      })

      for (const areaData of branchData.areas) {
        const area = await this.tenantRepo.createServiceArea({
          branchId: branch.id, name: areaData.name, type: areaData.type,
        })

        for (const tableData of areaData.tables) {
          await this.tenantRepo.createTable({
            branchId: branch.id, areaId: area.id, label: tableData.label, capacity: tableData.capacity,
          })
        }
      }
    }

    return { step: 'areas', completed: true }
  }

  // Step 3: Module Activation
  async saveModules(tenantId: string, features: { feature: string; enabled: boolean }[]) {
    for (const { feature, enabled } of features) {
      await this.tenantRepo.upsertFeatureFlag(tenantId, feature, enabled)
    }

    await this.tenantRepo.update(tenantId, { settings: { onboardingStep: 'launch' } })

    return { step: 'modules', completed: true }
  }

  // Step 4: Launch
  async launch(tenantId: string) {
    if (this.completeOnboardingUseCase) {
      return this.completeOnboardingUseCase.execute(tenantId)
    }

    await this.tenantRepo.update(tenantId, {
      settings: { onboardingCompleted: true, launchedAt: new Date().toISOString() },
      subscriptionStatus: 'active',
    })

    return { step: 'launch', completed: true, message: 'Sistema configurado y listo para usar!' }
  }

  // Get Status
  async getStatus(tenantId: string) {
    const tenant = await this.tenantRepo.findById(tenantId)
    if (!tenant) throw new Error('Tenant not found')

    const featureFlags = await this.tenantRepo.getFeatureFlags(tenantId)
    const settings = tenant.settings as any

    return {
      onboardingCompleted: settings?.onboardingCompleted || false,
      currentStep: settings?.onboardingStep || 'profile',
      businessType: tenant.businessType,
      features: featureFlags,
    }
  }
}
