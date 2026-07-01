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

export interface MenuRepository {
  findRecipeByMenuItem(menuItemId: string): Promise<RecipeWithIngredients | null>
  getMenu(tenantId: string): Promise<any[]>
  getMenuItems(tenantId: string, categoryId: string): Promise<any[]>
}
