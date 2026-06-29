import { z } from 'zod'

export const createCompanySchema = z.object({
  companyName: z.string().min(1).max(255),
  adminName: z.string().min(1).max(255),
  adminEmail: z.string().email(),
  businessType: z.enum(['fine_dining', 'fast_food', 'cafe', 'food_truck', 'bar', 'franchise', 'bakery', 'ghost_kitchen']),
  planId: z.enum(['basic', 'pro', 'enterprise']),
})
