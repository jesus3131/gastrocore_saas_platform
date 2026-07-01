import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'
import { ConnectDeliveryUseCase } from '../../core/use-cases/integrations/connect-delivery.use-case.js'

export class IntegrationService {
  constructor(private readonly connectDeliveryUseCase?: ConnectDeliveryUseCase) {}

  async getDeliveries(tenantId: string) {
    return prisma.integration.findMany({
      where: { tenantId, type: 'delivery' },
      select: { id: true, provider: true, enabled: true, createdAt: true, updatedAt: true },
      orderBy: { provider: 'asc' },
    })
  }

  async getPayments(tenantId: string) {
    return prisma.integration.findMany({
      where: { tenantId, type: 'payment' },
      select: { id: true, provider: true, enabled: true, createdAt: true, updatedAt: true },
      orderBy: { provider: 'asc' },
    })
  }

  async connectDelivery(tenantId: string, data: { provider: string; apiKey: string; storeId: string; config?: Record<string, unknown> }) {
    if (this.connectDeliveryUseCase) {
      return this.connectDeliveryUseCase.execute(tenantId, data)
    }

    const existing = await prisma.integration.findUnique({
      where: { tenantId_provider: { tenantId, provider: data.provider } },
    })
    if (existing) throw new AppError(409, 'INTEGRATION_EXISTS', `Already connected to ${data.provider}`)

    return prisma.integration.create({
      data: { tenantId, provider: data.provider, type: 'delivery', config: { apiKey: data.apiKey, storeId: data.storeId, ...data.config } },
    })
  }

  async connectPayment(tenantId: string, data: { provider: string; apiKey: string; webhookSecret?: string; config?: Record<string, unknown> }) {
    const existing = await prisma.integration.findUnique({
      where: { tenantId_provider: { tenantId, provider: data.provider } },
    })
    if (existing) throw new AppError(409, 'INTEGRATION_EXISTS', `Already connected to ${data.provider}`)

    return prisma.integration.create({
      data: { tenantId, provider: data.provider, type: 'payment', config: { apiKey: data.apiKey, webhookSecret: data.webhookSecret, ...data.config } },
    })
  }

  async toggleIntegration(tenantId: string, id: string, data: { enabled?: boolean; config?: Record<string, unknown> }) {
    const integration = await prisma.integration.findFirst({ where: { id, tenantId } })
    if (!integration) throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Integration not found')
    return prisma.integration.update({ where: { id }, data: { enabled: data.enabled, config: data.config as any } })
  }

  async disconnect(tenantId: string, id: string) {
    const integration = await prisma.integration.findFirst({ where: { id, tenantId } })
    if (!integration) throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Integration not found')
    await prisma.integration.delete({ where: { id } })
    return { message: `Disconnected from ${integration.provider}` }
  }

  async handleWebhook(data: { provider: string; event: string; payload: Record<string, unknown> }) {
    return { received: true, provider: data.provider, event: data.event }
  }
}
