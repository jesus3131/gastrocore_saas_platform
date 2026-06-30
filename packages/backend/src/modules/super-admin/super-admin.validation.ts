import { z } from 'zod'

export const createCompanySchema = z.object({
  companyName: z.string().min(1).max(255),
  adminName: z.string().min(1).max(255),
  adminEmail: z.string().email(),
  businessType: z.enum(['fine_dining', 'fast_food', 'cafe', 'food_truck', 'bar', 'franchise', 'bakery', 'ghost_kitchen']),
  planId: z.enum(['basic', 'pro', 'enterprise']),
  taxId: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
})

export const updateCompanySchema = z.object({
  companyName: z.string().min(1).max(255).optional(),
  businessType: z.enum(['fine_dining', 'fast_food', 'cafe', 'food_truck', 'bar', 'franchise', 'bakery', 'ghost_kitchen']).optional(),
  planId: z.enum(['basic', 'pro', 'enterprise']).optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  extraUsers: z.number().int().min(0).optional(),
})

export const updateCompanyModulesSchema = z.object({
  features: z.array(z.object({
    feature: z.string(),
    enabled: z.boolean(),
  })),
})
