import { z } from 'zod'

export const createOrderSchema = z.object({
  branchId: z.string().uuid().optional(),
  tableId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  type: z.enum(['dine_in', 'takeout', 'delivery', 'online']).default('dine_in'),
  subtotal: z.number().positive(),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  total: z.number().positive(),
  notes: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    name: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    notes: z.string().optional(),
    modifiers: z.array(z.object({
      groupId: z.string().uuid(),
      optionId: z.string().uuid(),
      name: z.string(),
      price: z.number(),
    })).optional(),
  })).min(1),
})

export const paymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['cash', 'card', 'transfer', 'mercadopago', 'stripe']),
  amount: z.number().positive(),
  reference: z.string().optional(),
})
