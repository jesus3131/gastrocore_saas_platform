export interface IngredientStock {
  id: string
  name: string
  unit: string
  currentStock: number
  minimumStock: number
}

export interface InventoryRepository {
  deductStock(ingredientId: string, tenantId: string, quantity: number): Promise<void>
  createMovement(ingredientId: string, type: string, quantity: number, reference: string): Promise<void>
  findById(ingredientId: string): Promise<IngredientStock | null>
}
