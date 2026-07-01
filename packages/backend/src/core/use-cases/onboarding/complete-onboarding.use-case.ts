import { injectable, inject } from 'tsyringe'
import type { TenantRepository } from '../../ports/repositories/tenant.repository.js'

@injectable()
export class CompleteOnboardingUseCase {
  constructor(
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
  ) {}

  async execute(tenantId: string) {
    const { AppError } = await import('../../../common/filters/error-handler.js')

    const tenant = await this.tenantRepo.findById(tenantId)
    if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant not found')

    const settings = { onboardingCompleted: true, launchedAt: new Date().toISOString() }

    const { prisma } = await import('../../../config/database/prisma.js')
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: settings as any, subscriptionStatus: 'active' },
    })

    return { step: 'launch', completed: true, message: 'Sistema configurado y listo para usar!' }
  }
}
