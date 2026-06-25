import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export const updateCustomerSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export const redeemPointsSchema = z.object({
  customerId: z.string().uuid(),
  points: z.number().int().positive(),
  reward: z.string().min(1),
})
