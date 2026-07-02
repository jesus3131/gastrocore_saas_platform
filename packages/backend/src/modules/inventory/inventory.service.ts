import { inject, injectable } from 'tsyringe'
import { AppError } from '../../common/filters/error-handler.js'
import { CreateIngredientUseCase } from '../../core/use-cases/inventory/create-ingredient.use-case.js'
import type { InventoryRepository } from '../../core/ports/repositories/inventory.repository.js'

@injectable()
export class InventoryService {
  constructor(
    @inject('InventoryRepository') private readonly inventoryRepo: InventoryRepository,
    private readonly createIngredientUseCase?: CreateIngredientUseCase,
  ) {}

  async getIngredients(tenantId: string, opts?: { limit?: number; offset?: number }) {
    return this.inventoryRepo.findManyIngredients(tenantId, opts)
  }

  async createIngredient(tenantId: string, data: any) {
    if (this.createIngredientUseCase) {
      return this.createIngredientUseCase.execute(tenantId, data)
    }
    return this.inventoryRepo.createIngredient(tenantId, data)
  }

  async updateIngredient(tenantId: string, id: string, data: any) {
    const ingredient = await this.inventoryRepo.findIngredientByTenant(tenantId, id)
    if (!ingredient) throw new AppError(404, 'INGREDIENT_NOT_FOUND', 'Ingredient not found')
    return this.inventoryRepo.updateIngredient(id, data)
  }

  async getRecipes(tenantId: string, opts?: { limit?: number; offset?: number }) {
    return this.inventoryRepo.findManyRecipes(tenantId, opts)
  }

  async createRecipe(tenantId: string, data: any) {
    return this.inventoryRepo.createRecipe(data)
  }

  async updateRecipe(tenantId: string, id: string, data: any) {
    return this.inventoryRepo.updateRecipe(id, data)
  }

  async getRecipeByItem(menuItemId: string, tenantId?: string) {
    const recipe = await this.inventoryRepo.findRecipeByItem(menuItemId, tenantId)
    if (!recipe) return null

    const totalCost = (recipe.ingredients ?? []).reduce(
      (sum: number, ri: any) => sum + Number(ri.ingredient.unitCost) * Number(ri.quantity),
      0,
    )

    return { ...recipe, totalCost }
  }

  async getStockAlerts(tenantId: string, opts?: { limit?: number; offset?: number }) {
    return this.inventoryRepo.findStockAlerts(tenantId, opts)
  }

  async getStockMovements(tenantId: string, opts?: { limit?: number; offset?: number }) {
    return this.inventoryRepo.findManyStockMovements(tenantId, opts)
  }
}
