import { z } from 'zod'

export const changePlanSchema = z.object({
  plan: z.enum(['basic', 'pro', 'enterprise']),
})
