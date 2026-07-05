import Stripe from 'stripe'
import { injectable } from 'tsyringe'
import type { PaymentResult } from '../integration.types.js'

@injectable()
export class StripeProvider {
  private stripe: Stripe

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY || ''
    this.stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia' })
  }

  async createPaymentIntent(data: {
    amount: number
    currency?: string
    metadata?: Record<string, string>
    customerId?: string
    description?: string
  }) {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100),
      currency: data.currency || 'mxn',
      metadata: data.metadata,
      customer: data.customerId,
      description: data.description,
      automatic_payment_methods: { enabled: true },
    })
    return {
      clientSecret: intent.client_secret,
      id: intent.id,
      amount: intent.amount / 100,
      status: intent.status,
    }
  }

  async createCheckoutSession(data: {
    items: { name: string; quantity: number; price: number }[]
    successUrl: string
    cancelUrl: string
    customerId?: string
    metadata?: Record<string, string>
  }) {
    const lineItems = data.items.map((item) => ({
      price_data: {
        currency: 'mxn',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const session = await this.stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      customer: data.customerId,
      metadata: data.metadata,
    })
    return { url: session.url, id: session.id }
  }

  async handleWebhook(rawBody: string, signature: string, webhookSecret: string) {
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    return event
  }

  async createCustomer(email: string, name: string, metadata?: Record<string, string>) {
    const customer = await this.stripe.customers.create({ email, name, metadata })
    return { id: customer.id, email: customer.email, name: customer.name }
  }

  async getPaymentIntent(id: string) {
    const intent = await this.stripe.paymentIntents.retrieve(id)
    return { id: intent.id, amount: intent.amount / 100, status: intent.status }
  }

  async confirmPayment(intentId: string): Promise<PaymentResult> {
    const intent = await this.stripe.paymentIntents.retrieve(intentId)
    return {
      success: intent.status === 'succeeded',
      transactionId: intentId,
      status: intent.status,
      providerReference: intent.latest_charge?.toString(),
    }
  }
}
