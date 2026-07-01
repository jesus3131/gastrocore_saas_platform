import { prisma } from '../../config/database/prisma.js'
import { BUSINESS_TYPE_FEATURES } from '@gastrocore/shared'
import type { BusinessType } from '@gastrocore/shared'
import { CompleteOnboardingUseCase } from '../../core/use-cases/onboarding/complete-onboarding.use-case.js'

export class OnboardingService {
  constructor(private readonly completeOnboardingUseCase?: CompleteOnboardingUseCase) {}

  // Step 1: Business Profile
  async saveProfile(tenantId: string, data: { name: string; businessType: string; locale: string; timezone: string; currency: string }) {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        businessType: data.businessType as any,
        locale: data.locale,
        timezone: data.timezone,
        currency: data.currency,
        settings: {
          ...(await prisma.tenant.findUnique({ where: { id: tenantId } }))?.settings as any,
          onboardingStep: 'areas',
        },
      },
    })

    const defaultFeatures = BUSINESS_TYPE_FEATURES[data.businessType as BusinessType] || []
    for (const feature of defaultFeatures) {
      await prisma.tenantFeatureFlag.upsert({
        where: { tenantId_feature: { tenantId, feature } },
        update: { enabled: true },
        create: { tenantId, feature, enabled: true },
      })
    }

    return tenant
  }

  // Step 2: Areas & Tables
  async saveAreas(tenantId: string, data: { branches: { name: string; areas: { name: string; type: string; tables: { label: string; capacity: number }[] }[] }[] }) {
    for (const branchData of data.branches) {
      const branch = await prisma.branch.create({
        data: { tenantId, name: branchData.name, settings: { onboardingStep: 'modules' } },
      })

      for (const areaData of branchData.areas) {
        const area = await prisma.serviceArea.create({
          data: { branchId: branch.id, name: areaData.name, type: areaData.type },
        })

        for (const tableData of areaData.tables) {
          await prisma.table.create({
            data: { branchId: branch.id, areaId: area.id, label: tableData.label, capacity: tableData.capacity },
          })
        }
      }
    }

    return { step: 'areas', completed: true }
  }

  // Step 3: Module Activation
  async saveModules(tenantId: string, features: { feature: string; enabled: boolean }[]) {
    for (const { feature, enabled } of features) {
      await prisma.tenantFeatureFlag.upsert({
        where: { tenantId_feature: { tenantId, feature } },
        update: { enabled },
        create: { tenantId, feature, enabled },
      })
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: { onboardingStep: 'launch' } },
    })

    return { step: 'modules', completed: true }
  }

  // Step 4: Launch
  async launch(tenantId: string) {
    if (this.completeOnboardingUseCase) {
      return this.completeOnboardingUseCase.execute(tenantId)
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: { onboardingCompleted: true, launchedAt: new Date().toISOString() },
        subscriptionStatus: 'active',
      },
    })

    return { step: 'launch', completed: true, message: 'Sistema configurado y listo para usar!' }
  }

  // Get Status
  async getStatus(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { featureFlags: true },
    })
    if (!tenant) throw new Error('Tenant not found')

    const settings = tenant.settings as any
    return {
      onboardingCompleted: settings?.onboardingCompleted || false,
      currentStep: settings?.onboardingStep || 'profile',
      businessType: tenant.businessType,
      features: tenant.featureFlags,
    }
  }
}
