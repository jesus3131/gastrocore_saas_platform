import { z } from 'zod'

export const saveProfileSchema = z.object({
  name: z.string().min(1).max(255),
  businessType: z.enum(['fine_dining', 'fast_food', 'cafe', 'food_truck', 'bar', 'franchise', 'bakery', 'ghost_kitchen']),
  locale: z.string().min(2).max(10),
  timezone: z.string().min(1).max(100),
  currency: z.string().min(3).max(3),
})

export const saveAreasSchema = z.object({
  branches: z.array(z.object({
    name: z.string().min(1).max(255),
    areas: z.array(z.object({
      name: z.string().min(1).max(255),
      type: z.string().min(1).max(50),
      tables: z.array(z.object({
        label: z.string().min(1).max(50),
        capacity: z.number().int().positive(),
      })),
    })),
  })),
})

export const saveModulesSchema = z.object({
  features: z.array(z.object({
    feature: z.string().min(1),
    enabled: z.boolean(),
  })).min(1),
})
