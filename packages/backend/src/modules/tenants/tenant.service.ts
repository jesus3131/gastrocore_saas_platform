import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'
import { BUSINESS_TYPE_FEATURES } from '@gastrocore/shared'
import { UpdateFeaturesUseCase } from '../../core/use-cases/tenants/update-features.use-case.js'

export class TenantService {
  constructor(private readonly updateFeaturesUseCase?: UpdateFeaturesUseCase) {}
  async getConfig(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
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
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: data as any,
    })
    return tenant
  }

  async getFeatures(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { featureFlags: true },
    })
    if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant not found')

    // Merge default features for business type with overrides
    const defaults = BUSINESS_TYPE_FEATURES[tenant.businessType] || []
    const overrides = tenant.featureFlags.reduce((acc, f) => {
      acc[f.feature] = f.enabled
      return acc
    }, {} as Record<string, boolean>)

    return {
      businessType: tenant.businessType,
      features: defaults.map((feature) => ({
        feature,
        enabled: overrides[feature] ?? true,
      })),
    }
  }

  async updateFeatures(tenantId: string, features: { feature: string; enabled: boolean }[]) {
    if (this.updateFeaturesUseCase) {
      return this.updateFeaturesUseCase.execute(tenantId, features)
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant not found')

    for (const { feature, enabled } of features) {
      await prisma.tenantFeatureFlag.upsert({
        where: { tenantId_feature: { tenantId, feature } },
        update: { enabled },
        create: { tenantId, feature, enabled },
      })
    }

    return this.getFeatures(tenantId)
  }
}
