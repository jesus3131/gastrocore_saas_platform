import { z } from 'zod'

export const updateTenantConfigSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  locale: z.string().min(2).max(10).optional(),
  timezone: z.string().min(1).max(100).optional(),
  currency: z.string().min(3).max(3).optional(),
  settings: z.record(z.unknown()).optional(),
  customFields: z.record(z.unknown()).optional(),
})

export const updateFeaturesSchema = z.object({
  features: z.array(z.object({
    feature: z.string().min(1),
    enabled: z.boolean(),
  })).min(1),
})
