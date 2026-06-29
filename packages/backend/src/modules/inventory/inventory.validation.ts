import { z } from 'zod'

export const createIngredientSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().optional(),
  unit: z.string().min(1).max(50),
  unitCost: z.number().positive(),
  currentStock: z.number().min(0).default(0),
  minimumStock: z.number().min(0).default(0),
  isActive: z.boolean().optional(),
})

export const updateIngredientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  sku: z.string().optional(),
  unit: z.string().min(1).max(50).optional(),
  unitCost: z.number().positive().optional(),
  currentStock: z.number().min(0).optional(),
  minimumStock: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

const recipeIngredientSchema = z.object({
  ingredientId: z.string().uuid(),
  quantity: z.number().positive(),
})

export const createRecipeSchema = z.object({
  menuItemId: z.string().uuid(),
  name: z.string().min(1).max(255),
  servings: z.number().int().positive().default(1),
  wastePercentage: z.number().min(0).max(100).default(0),
  instructions: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1),
})

export const updateRecipeSchema = z.object({
  menuItemId: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
  servings: z.number().int().positive().optional(),
  wastePercentage: z.number().min(0).max(100).optional(),
  instructions: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).optional(),
})
