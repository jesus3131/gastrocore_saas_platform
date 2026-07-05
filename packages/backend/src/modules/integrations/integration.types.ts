import type { z } from 'zod'
import type { connectDeliverySchema, connectPaymentSchema, createPaymentIntentSchema, createMpPreferenceSchema, syncMenuSchema, deliveryOrderStatusSchema } from './integration.validation.js'

export type ConnectDeliveryInput = z.infer<typeof connectDeliverySchema>
export type ConnectPaymentInput = z.infer<typeof connectPaymentSchema>
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type CreateMpPreferenceInput = z.infer<typeof createMpPreferenceSchema>
export type SyncMenuInput = z.infer<typeof syncMenuSchema>
export type DeliveryOrderStatusInput = z.infer<typeof deliveryOrderStatusSchema>

export interface DeliveryOrder {
  id: string
  tenantId: string
  provider: string
  externalId: string
  customerName: string
  customerPhone?: string
  customerAddress?: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  status: 'pending' | 'preparing' | 'in_transit' | 'delivered' | 'canceled'
  notes?: string
  createdAt: Date
}

export interface PaymentResult {
  success: boolean
  transactionId: string
  status: string
  providerReference?: string
  metadata?: Record<string, unknown>
}
