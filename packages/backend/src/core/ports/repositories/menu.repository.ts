export interface RecipeIngredientData {
  ingredientId: string
  quantity: number
  name: string
  unit: string
}

export interface RecipeWithIngredients {
  id: string
  menuItemId: string
  name: string
  servings: number
  ingredients: RecipeIngredientData[]
}

import type { MenuCategory, MenuItem } from '../../../core/domain/entities/index.js'

export interface MenuRepository {
  findRecipeByMenuItem(menuItemId: string): Promise<RecipeWithIngredients | null>
  getMenu(tenantId: string): Promise<MenuCategory[]>
  getMenuItems(tenantId: string, categoryId: string): Promise<MenuItem[]>
}
