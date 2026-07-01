import { inject, injectable } from 'tsyringe'
import { AppError } from '../../common/filters/error-handler.js'
import { ConnectDeliveryUseCase } from '../../core/use-cases/integrations/connect-delivery.use-case.js'
import type { IntegrationRepository } from '../../core/ports/repositories/integration.repository.js'

@injectable()
export class IntegrationService {
  constructor(
    @inject('IntegrationRepository') private readonly integrationRepo: IntegrationRepository,
    private readonly connectDeliveryUseCase?: ConnectDeliveryUseCase,
  ) {}

  async getDeliveries(tenantId: string) {
    const integrations = await this.integrationRepo.findMany(tenantId, 'delivery')
    return integrations.map(({ config, ...rest }: any) => ({ ...rest, hasConfig: !!config }))
  }

  async getPayments(tenantId: string) {
    const integrations = await this.integrationRepo.findMany(tenantId, 'payment')
    return integrations.map(({ config, ...rest }: any) => ({ ...rest, hasConfig: !!config }))
  }

  async connectDelivery(tenantId: string, data: { provider: string; apiKey: string; storeId: string; config?: Record<string, unknown> }) {
    if (this.connectDeliveryUseCase) {
      return this.connectDeliveryUseCase.execute(tenantId, data)
    }

    const existing = await this.integrationRepo.findUnique({
      where: { tenantId_provider: { tenantId, provider: data.provider } },
    })
    if (existing) throw new AppError(409, 'INTEGRATION_EXISTS', `Already connected to ${data.provider}`)

    return this.integrationRepo.create({
      tenantId, provider: data.provider, type: 'delivery', config: { apiKey: data.apiKey, storeId: data.storeId, ...data.config },
    })
  }

  async connectPayment(tenantId: string, data: { provider: string; apiKey: string; webhookSecret?: string; config?: Record<string, unknown> }) {
    const existing = await this.integrationRepo.findUnique({
      where: { tenantId_provider: { tenantId, provider: data.provider } },
    })
    if (existing) throw new AppError(409, 'INTEGRATION_EXISTS', `Already connected to ${data.provider}`)

    return this.integrationRepo.create({
      tenantId, provider: data.provider, type: 'payment', config: { apiKey: data.apiKey, webhookSecret: data.webhookSecret, ...data.config },
    })
  }

  async toggleIntegration(tenantId: string, id: string, data: { enabled?: boolean; config?: Record<string, unknown> }) {
    const integration = await this.integrationRepo.findFirst({ where: { id, tenantId } })
    if (!integration) throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Integration not found')
    return this.integrationRepo.update(id, { enabled: data.enabled, config: data.config as any })
  }

  async disconnect(tenantId: string, id: string) {
    const integration = await this.integrationRepo.findFirst({ where: { id, tenantId } })
    if (!integration) throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Integration not found')
    await this.integrationRepo.delete(id)
    return { message: `Disconnected from ${integration.provider}` }
  }

  async handleWebhook(data: { provider: string; event: string; payload: Record<string, unknown> }) {
    return { received: true, provider: data.provider, event: data.event }
  }
}
