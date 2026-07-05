import { inject, injectable } from 'tsyringe'
import { AppError } from '../../common/filters/error-handler.js'
import { BUSINESS_TYPE_FEATURES } from '@gastrocore/shared'
import { UpdateFeaturesUseCase } from '../../core/use-cases/tenants/update-features.use-case.js'
import type { TenantRepository } from '../../core/ports/repositories/tenant.repository.js'

@injectable()
export class TenantService {
  constructor(
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
    private readonly updateFeaturesUseCase?: UpdateFeaturesUseCase,
  ) {}

  async getConfig(tenantId: string) {
    const tenant = await this.tenantRepo.findById(tenantId)
    if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant not found')
    return tenant
  }

  async updateConfig(tenantId: string, data: Partial<{
    name: string
    locale: string
    timezone: string
    currency: string
    settings: any
    customFields: any
  }>) {
    return this.tenantRepo.update(tenantId, data as any)
  }

  async getFeatures(tenantId: string) {
    const tenant = await this.tenantRepo.findById(tenantId)
    if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant not found')

    const featureFlags = await this.tenantRepo.getFeatureFlags(tenantId)

    const defaults = BUSINESS_TYPE_FEATURES[tenant.businessType as keyof typeof BUSINESS_TYPE_FEATURES] || []
    const overrides = (featureFlags || []).reduce((acc: Record<string, boolean>, f: any) => {
      acc[f.feature] = f.enabled
      return acc
    }, {} as Record<string, boolean>)

    return {
      businessType: tenant.businessType,
      features: defaults.map((feature: string) => ({
        feature,
        enabled: overrides[feature] ?? true,
      })),
    }
  }

  async updateFeatures(tenantId: string, features: { feature: string; enabled: boolean }[]) {
    if (this.updateFeaturesUseCase) {
      return this.updateFeaturesUseCase.execute(tenantId, features)
    }

    const tenant = await this.tenantRepo.findById(tenantId)
    if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant not found')

    for (const { feature, enabled } of features) {
      await this.tenantRepo.upsertFeatureFlag(tenantId, feature, enabled)
    }

    return this.getFeatures(tenantId)
  }
}
