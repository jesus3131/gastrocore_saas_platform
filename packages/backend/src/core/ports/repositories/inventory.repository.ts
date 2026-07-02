import type { InventoryIngredient, InventoryRecipe, StockMovement, PaginationOpts } from '../../../core/domain/entities/index.js'

export interface IngredientStock {
  id: string
  name: string
  unit: string
  currentStock: number
  minimumStock: number
}

export interface InventoryRepository {
  deductStock(ingredientId: string, tenantId: string, quantity: number): Promise<void>
  createMovement(ingredientId: string, tenantId: string, type: string, quantity: number, reference: string): Promise<void>
  findById(ingredientId: string): Promise<IngredientStock | null>

  findManyIngredients(tenantId: string, opts?: PaginationOpts): Promise<InventoryIngredient[]>
  createIngredient(tenantId: string, data: any): Promise<InventoryIngredient>
  findIngredientByTenant(tenantId: string, id: string): Promise<InventoryIngredient | null>
  updateIngredient(id: string, data: any): Promise<InventoryIngredient>
  findStockAlerts(tenantId: string, opts?: PaginationOpts): Promise<InventoryIngredient[]>

  findManyRecipes(tenantId: string, opts?: PaginationOpts): Promise<InventoryRecipe[]>
  createRecipe(data: any): Promise<InventoryRecipe>
  updateRecipe(id: string, data: any): Promise<InventoryRecipe>
  findRecipeByItem(menuItemId: string, tenantId?: string): Promise<InventoryRecipe | null>

  findManyStockMovements(tenantId: string, opts?: PaginationOpts): Promise<StockMovement[]>
}
