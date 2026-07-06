import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().min(0).optional(),
  imageUrl: z.string().max(500).optional(),
  available: z.boolean().optional(),
  sortOrder: z.number().int().min(0).default(0),
})

export const updateMenuItemSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  cost: z.number().min(0).optional(),
  imageUrl: z.string().max(500).optional(),
  available: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})
