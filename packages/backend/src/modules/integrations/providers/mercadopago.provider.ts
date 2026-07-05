import { injectable } from 'tsyringe'
import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from 'mercadopago'
import type { PaymentResult } from '../integration.types.js'

@injectable()
export class MercadoPagoProvider {
  private client: MercadoPagoConfig

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    this.client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } })
  }

  async createPreference(data: {
    items: { title: string; quantity: number; unitPrice: number; id?: string }[]
    payer?: { email?: string; name?: string }
    backUrls?: { success: string; failure: string; pending: string }
    autoReturn?: 'approved' | 'all' | 'none'
    notificationUrl?: string
    metadata?: Record<string, unknown>
  }) {
    const preference = new Preference(this.client)
    const result = await preference.create({
      body: {
        items: data.items.map((item) => ({
          ...(item.id ? { id: item.id } : {}),
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: 'MXN',
        })) as any,
        payer: data.payer ? { email: data.payer.email, name: data.payer.name } : undefined,
        back_urls: data.backUrls,
        auto_return: data.autoReturn || 'approved',
        notification_url: data.notificationUrl,
        metadata: data.metadata,
      },
    })
    return { id: result.id, initPoint: result.init_point, sandboxInitPoint: result.sandbox_init_point }
  }

  async handleWebhook(data: { type: string; id: string }) {
    if (data.type === 'payment') {
      const payment = new Payment(this.client)
      const info = await payment.get({ id: data.id })
      return info
    }
    if (data.type === 'merchant_order') {
      const merchantOrder = new MerchantOrder(this.client)
      const info = await merchantOrder.get({ merchantOrderId: data.id })
      return info
    }
    return data
  }

  async getPaymentInfo(id: string) {
    const payment = new Payment(this.client)
    const info = await payment.get({ id })
    return {
      id: info.id,
      status: info.status,
      statusDetail: info.status_detail,
      amount: info.transaction_amount,
      currency: info.currency_id,
      payerEmail: info.payer?.email,
    }
  }

  async confirmPayment(paymentId: string): Promise<PaymentResult> {
    const info = await this.getPaymentInfo(paymentId)
    return {
      success: info.status === 'approved',
      transactionId: paymentId,
      status: info.status || 'unknown',
    }
  }
}
