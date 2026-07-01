import { z } from 'zod'

export const connectDeliverySchema = z.object({
  provider: z.enum(['rappi', 'uber_eats', 'didi']),
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
  config: z.record(z.unknown()).optional(),
})

export const webhookSchema = z.object({
  provider: z.string().min(1),
  event: z.string().min(1),
  payload: z.record(z.unknown()),
})
