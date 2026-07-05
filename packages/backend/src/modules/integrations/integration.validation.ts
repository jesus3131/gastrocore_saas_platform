import { z } from 'zod'

export const connectDeliverySchema = z.object({
  provider: z.enum(['rappi', 'uber_eats', 'didi_food']),
  apiKey: z.string().min(1),
  storeId: z.string().min(1),
  config: z.record(z.unknown()).optional(),
})

export const connectPaymentSchema = z.object({
  provider: z.enum(['mercadopago', 'stripe']),
  apiKey: z.string().min(1),
  webhookSecret: z.string().optional(),
  config: z.record(z.unknown()).optional(),
})

export const updateIntegrationSchema = z.object({
  enabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
})

export const webhookSchema = z.object({
  provider: z.string().min(1),
  event: z.string().min(1),
  payload: z.record(z.unknown()),
})

export const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  orderId: z.string().uuid(),
  description: z.string().optional(),
})

export const createMpPreferenceSchema = z.object({
  items: z.array(z.object({
    title: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    id: z.string().optional(),
  })).min(1),
  payerEmail: z.string().email().optional(),
  payerName: z.string().optional(),
  successUrl: z.string().url(),
  failureUrl: z.string().url(),
  pendingUrl: z.string().url(),
  notificationUrl: z.string().optional(),
})

export const syncMenuSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    category: z.string().optional(),
    available: z.boolean(),
  })).min(1),
})

export const deliveryOrderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'in_transit', 'delivered', 'canceled']),
})

export const stripeWebhookSchema = z.object({
  body: z.any(),
  signature: z.string().min(1),
})

export const mpNotificationSchema = z.object({
  type: z.string(),
  id: z.string(),
})
