import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(255),
  tenantName: z.string().min(1).max(255),
  businessType: z.enum(['fine_dining', 'fast_food', 'cafe', 'food_truck', 'bar', 'franchise', 'bakery', 'ghost_kitchen']),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100),
})
