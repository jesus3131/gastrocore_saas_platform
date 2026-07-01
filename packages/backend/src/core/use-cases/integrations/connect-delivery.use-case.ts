import { injectable, inject } from 'tsyringe'
import type { IntegrationRepository } from '../../ports/repositories/integration.repository.js'

@injectable()
export class ConnectDeliveryUseCase {
  constructor(
    @inject('IntegrationRepository') private readonly integrationRepo: IntegrationRepository,
  ) {}

  async execute(tenantId: string, data: { provider: string; apiKey: string; storeId: string; config?: Record<string, unknown> }) {
    const { AppError } = await import('../../../common/filters/error-handler.js')

    const existing = await this.integrationRepo.findUnique({
      where: { tenantId_provider: { tenantId, provider: data.provider } },
    })
    if (existing) throw new AppError(409, 'INTEGRATION_EXISTS', `Already connected to ${data.provider}`)

    return this.integrationRepo.create({
      tenantId,
      provider: data.provider,
      type: 'delivery',
      config: { apiKey: data.apiKey, storeId: data.storeId, ...data.config },
    })
  }
}
