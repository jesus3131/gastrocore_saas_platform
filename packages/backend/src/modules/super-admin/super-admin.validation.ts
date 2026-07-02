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

export const deleteCompanySchema = z.object({
  confirmation: z.literal('ELIMINAR', {
    errorMap: () => ({ message: 'Debe escribir exactamente "ELIMINAR" para confirmar' }),
  }),
})

export const migratePlanSchema = z.object({
  planId: z.enum(['basic', 'pro', 'enterprise']),
})

export const createInvoiceSchema = z.object({
  tenantId: z.string().uuid(),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
})

export const createCalendarEventSchema = z.object({
  tenantId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(['maintenance', 'billing', 'security', 'meeting', 'other']),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Use ISO date format YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  allDay: z.boolean().optional(),
})
