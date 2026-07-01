import { AppError } from '../../../common/filters/error-handler.js'
import { BUSINESS_TYPE_FEATURES } from '@gastrocore/shared'
import { injectable, inject } from 'tsyringe'
import type { TenantRepository } from '../../ports/repositories/tenant.repository.js'

@injectable()
export class UpdateFeaturesUseCase {
  constructor(
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
  ) {}

  async execute(tenantId: string, features: { feature: string; enabled: boolean }[]) {
    const tenant = await this.tenantRepo.findById(tenantId)
    if (!tenant) {
      throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant not found')
    }

    for (const { feature, enabled } of features) {
      await this.tenantRepo.upsertFeatureFlag(tenantId, feature, enabled)
    }

    return this.getFeatures(tenantId)
  }

  private async getFeatures(tenantId: string) {
    const tenant = await this.tenantRepo.findById(tenantId)
    if (!tenant) throw new Error('Tenant not found')

    const flags = await this.tenantRepo.getFeatureFlags(tenantId)
    const businessType = tenant.businessType as string
    const defaults = (BUSINESS_TYPE_FEATURES as any)[businessType] || []
    const overrides = flags.reduce((acc: Record<string, boolean>, f: any) => {
      acc[f.feature] = f.enabled
      return acc
    }, {})

    return {
      businessType: tenant.businessType,
      features: defaults.map((feature: string) => ({
        feature,
        enabled: overrides[feature] ?? true,
      })),
    }
  }
}
