import { inject, injectable, container } from 'tsyringe'
import { AppError } from '../../common/filters/error-handler.js'
import { ConnectDeliveryUseCase } from '../../core/use-cases/integrations/connect-delivery.use-case.js'
import type { IntegrationRepository } from '../../core/ports/repositories/integration.repository.js'
import type { PaymentResult } from './integration.types.js'
import { StripeProvider } from './providers/stripe.provider.js'
import { MercadoPagoProvider } from './providers/mercadopago.provider.js'
import { RappiProvider } from './providers/rappi.provider.js'
import { UberEatsProvider } from './providers/ubereats.provider.js'

@injectable()
export class IntegrationService {
  constructor(
    @inject('IntegrationRepository') private readonly integrationRepo: IntegrationRepository,
    private readonly connectDeliveryUseCase?: ConnectDeliveryUseCase,
  ) {}

  private getStripeProvider(): any {
    return container.isRegistered(StripeProvider) ? container.resolve(StripeProvider) as any : undefined
  }

  private getMercadoPagoProvider(): any {
    return container.isRegistered(MercadoPagoProvider) ? container.resolve(MercadoPagoProvider) as any : undefined
  }

  private getRappiProvider(): any {
    return container.isRegistered(RappiProvider) ? container.resolve(RappiProvider) as any : undefined
  }

  private getUberEatsProvider(): any {
    return container.isRegistered(UberEatsProvider) ? container.resolve(UberEatsProvider) as any : undefined
  }

  async getDeliveries(tenantId: string) {
    const integrations = await this.integrationRepo.findMany(tenantId, 'delivery')
    return integrations.map(({ config, ...rest }: any) => ({
      ...rest,
      hasConfig: !!config,
      channel: rest.provider,
      isActive: rest.enabled,
    }))
  }

  async getPayments(tenantId: string) {
    const integrations = await this.integrationRepo.findMany(tenantId, 'payment')
    return integrations.map(({ config, ...rest }: any) => ({
      ...rest,
      hasConfig: !!config,
      channel: rest.provider,
      isActive: rest.enabled,
    }))
  }

  async connectDelivery(tenantId: string, data: { provider: string; apiKey: string; storeId: string; config?: Record<string, unknown> }) {
    if (this.connectDeliveryUseCase) {
      return this.connectDeliveryUseCase.execute(tenantId, data)
    }
    const existing = await this.integrationRepo.findUnique({
      tenantId_provider: { tenantId, provider: data.provider },
    })
    if (existing) throw new AppError(409, 'INTEGRATION_EXISTS', `Already connected to ${data.provider}`)
    return this.integrationRepo.create({
      tenantId, provider: data.provider, type: 'delivery', config: { apiKey: data.apiKey, storeId: data.storeId, ...data.config },
    })
  }

  async connectPayment(tenantId: string, data: { provider: string; apiKey: string; webhookSecret?: string; config?: Record<string, unknown> }) {
    const existing = await this.integrationRepo.findUnique({
      tenantId_provider: { tenantId, provider: data.provider },
    })
    if (existing) throw new AppError(409, 'INTEGRATION_EXISTS', `Already connected to ${data.provider}`)
    return this.integrationRepo.create({
      tenantId, provider: data.provider, type: 'payment', config: { apiKey: data.apiKey, webhookSecret: data.webhookSecret, ...data.config },
    })
  }

  async toggleIntegration(tenantId: string, id: string, data: { enabled?: boolean; isActive?: boolean; config?: Record<string, unknown> }) {
    const integration = await this.integrationRepo.findFirst({ where: { id, tenantId } })
    if (!integration) throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Integration not found')
    const enabled = data.enabled ?? data.isActive
    return this.integrationRepo.update(id, { enabled, config: data.config as any })
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

  async createPaymentIntent(tenantId: string, data: { amount: number; currency?: string; orderId: string; description?: string }) {
    const stripe = this.getStripeProvider()
    if (!stripe) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'Stripe provider not configured')
    const integration = await this.getActiveIntegration(tenantId, 'stripe')
    if (!integration) throw new AppError(400, 'STRIPE_NOT_CONFIGURED', 'Stripe is not configured for this tenant')
    return stripe.createPaymentIntent({
      amount: data.amount,
      currency: data.currency || 'mxn',
      description: data.description,
      metadata: { tenantId, orderId: data.orderId },
    })
  }

  async confirmPayment(tenantId: string, provider: string, transactionId: string): Promise<PaymentResult> {
    if (provider === 'stripe') {
      const stripe = this.getStripeProvider()
      if (!stripe) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'Stripe provider not configured')
      return stripe.confirmPayment(transactionId)
    }
    if (provider === 'mercadopago') {
      const mp = this.getMercadoPagoProvider()
      if (!mp) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'MercadoPago provider not configured')
      return mp.confirmPayment(transactionId)
    }
    throw new AppError(400, 'UNKNOWN_PROVIDER', `Unknown payment provider: ${provider}`)
  }

  async createMpPreference(tenantId: string, data: {
    items: { title: string; quantity: number; unitPrice: number; id?: string }[]
    payerEmail?: string; payerName?: string
    successUrl: string; failureUrl: string; pendingUrl: string
    notificationUrl?: string
  }) {
    const mp = this.getMercadoPagoProvider()
    if (!mp) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'MercadoPago provider not configured')
    await this.getActiveIntegration(tenantId, 'mercadopago')
    return mp.createPreference({
      items: data.items,
      payer: data.payerEmail ? { email: data.payerEmail, name: data.payerName } : undefined,
      backUrls: { success: data.successUrl, failure: data.failureUrl, pending: data.pendingUrl },
      notificationUrl: data.notificationUrl,
      metadata: { tenantId },
    })
  }

  async handleStripeWebhook(rawBody: string, signature: string) {
    const stripe = this.getStripeProvider()
    if (!stripe) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'Stripe provider not configured')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
    if (!webhookSecret) throw new AppError(400, 'WEBHOOK_NOT_CONFIGURED', 'Stripe webhook secret not configured')
    return stripe.handleWebhook(rawBody, signature, webhookSecret)
  }

  async handleMpNotification(data: { type: string; id: string }) {
    const mp = this.getMercadoPagoProvider()
    if (!mp) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'MercadoPago provider not configured')
    return mp.handleWebhook(data)
  }

  async syncDeliveryMenu(tenantId: string, provider: string, data: { items: { id: string; name: string; description?: string; price: number; category?: string; available: boolean }[] }) {
    const integration = await this.getActiveIntegration(tenantId, provider)
    if (!integration) throw new AppError(400, 'INTEGRATION_NOT_ACTIVE', `${provider} is not connected`)
    const config = integration.config as any
    const apiKey = config?.apiKey
    const storeId = config?.storeId
    if (!apiKey || !storeId) throw new AppError(400, 'INTEGRATION_NOT_CONFIGURED', `${provider} missing apiKey or storeId`)

    if (provider === 'rappi') {
      const rappi = this.getRappiProvider()
      if (!rappi) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'Rappi provider not configured')
      return rappi.syncMenu(data.items, apiKey, storeId)
    }
    if (provider === 'uber_eats') {
      const ue = this.getUberEatsProvider()
      if (!ue) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'UberEats provider not configured')
      return ue.syncMenu(data.items, apiKey, storeId)
    }
    throw new AppError(400, 'UNKNOWN_PROVIDER', `Unknown delivery provider: ${provider}`)
  }

  async updateDeliveryOrderStatus(tenantId: string, provider: string, orderId: string, status: string) {
    const integration = await this.getActiveIntegration(tenantId, provider)
    if (!integration) throw new AppError(400, 'INTEGRATION_NOT_ACTIVE', `${provider} is not connected`)
    const apiKey = (integration.config as any)?.apiKey

    if (provider === 'rappi') {
      const rappi = this.getRappiProvider()
      if (!rappi) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'Rappi provider not configured')
      return rappi.updateOrderStatus(orderId, status, apiKey)
    }
    if (provider === 'uber_eats') {
      const ue = this.getUberEatsProvider()
      if (!ue) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'UberEats provider not configured')
      return ue.updateOrderStatus(orderId, status, apiKey)
    }
    throw new AppError(400, 'UNKNOWN_PROVIDER', `Unknown delivery provider: ${provider}`)
  }

  async handleDeliveryWebhook(tenantId: string, provider: string, payload: Record<string, unknown>) {
    const integration = await this.getActiveIntegration(tenantId, provider)
    if (!integration) throw new AppError(400, 'INTEGRATION_NOT_ACTIVE', `${provider} is not connected`)
    const apiKey = (integration.config as any)?.apiKey || ''

    if (provider === 'rappi') {
      const rappi = this.getRappiProvider()
      if (!rappi) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'Rappi provider not configured')
      return rappi.handleOrderNotification(payload, apiKey)
    }
    if (provider === 'uber_eats') {
      const ue = this.getUberEatsProvider()
      if (!ue) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'UberEats provider not configured')
      return ue.handleOrderNotification(payload, apiKey)
    }
    throw new AppError(400, 'UNKNOWN_PROVIDER', `Unknown delivery provider: ${provider}`)
  }

  async getDeliveryOrders(tenantId: string, provider: string) {
    if (provider === 'rappi') {
      const rappi = this.getRappiProvider()
      if (!rappi) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'Rappi provider not configured')
      return rappi.getOrders()
    }
    if (provider === 'uber_eats') {
      const ue = this.getUberEatsProvider()
      if (!ue) throw new AppError(501, 'PROVIDER_NOT_AVAILABLE', 'UberEats provider not configured')
      return ue.getOrders()
    }
    throw new AppError(400, 'UNKNOWN_PROVIDER', `Unknown delivery provider: ${provider}`)
  }

  private async getActiveIntegration(tenantId: string, provider: string) {
    const integration = await this.integrationRepo.findUnique({
      tenantId_provider: { tenantId, provider },
    })
    return integration?.enabled ? integration : null
  }
}
