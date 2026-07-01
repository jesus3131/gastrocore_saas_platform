import { prisma } from '../../../config/database/prisma.js'
import type { IngredientStock, InventoryRepository } from '../../../core/ports/repositories/inventory.repository.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaInventoryRepository implements InventoryRepository {
  async deductStock(ingredientId: string, tenantId: string, quantity: number): Promise<void> {
    const client = getClient()
    await client.ingredient.updateMany({
      where: { tenantId, id: ingredientId },
      data: { currentStock: { decrement: quantity } },
    })
  }

  async createMovement(ingredientId: string, type: string, quantity: number, reference: string): Promise<void> {
    const client = getClient()
    await client.stockMovement.create({
      data: { ingredientId, type, quantity, reference },
    })
  }

  async findById(ingredientId: string): Promise<IngredientStock | null> {
    const client = getClient()
    const ingredient = await client.ingredient.findFirst({ where: { id: ingredientId } })
    if (!ingredient) return null
    return {
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      currentStock: Number(ingredient.currentStock),
      minimumStock: Number(ingredient.minimumStock),
    }
  }

  async findManyIngredients(tenantId: string, opts?: { limit?: number; offset?: number }): Promise<any[]> {
    const client = getClient()
    return client.ingredient.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
      take: opts?.limit,
      skip: opts?.offset,
    })
  }

  async createIngredient(tenantId: string, data: any): Promise<any> {
    const client = getClient()
    return client.ingredient.create({ data: { ...data, tenantId } })
  }

  async findIngredientByTenant(tenantId: string, id: string): Promise<any | null> {
    const client = getClient()
    return client.ingredient.findFirst({ where: { tenantId, id } })
  }

  async updateIngredient(id: string, data: any): Promise<any> {
    const client = getClient()
    return client.ingredient.update({ where: { id }, data })
  }

  async findStockAlerts(tenantId: string, opts?: { limit?: number; offset?: number }): Promise<any[]> {
    const client = getClient()
    return client.ingredient.findMany({
      where: { tenantId, currentStock: { lte: client.ingredient.fields.minimumStock } },
      orderBy: { currentStock: 'asc' },
      take: opts?.limit,
      skip: opts?.offset,
    })
  }

  async findManyRecipes(tenantId: string, opts?: { limit?: number; offset?: number }): Promise<any[]> {
    const client = getClient()
    return client.recipe.findMany({
      where: { menuItem: { tenantId } },
      include: { ingredients: { include: { ingredient: true } }, menuItem: true },
      take: opts?.limit,
      skip: opts?.offset,
    })
  }

  async createRecipe(data: any): Promise<any> {
    const client = getClient()
    return client.recipe.create({
      data: {
        menuItemId: data.menuItemId,
        name: data.name,
        servings: data.servings || 1,
        wastePercentage: data.wastePercentage || 0,
        instructions: data.instructions,
        ingredients: {
          create: (data.ingredients || []).map((ing: any) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
          })),
        },
      },
      include: { ingredients: { include: { ingredient: true } } },
    })
  }

  async updateRecipe(id: string, data: any): Promise<any> {
    const client = getClient()
    return client.recipe.update({
      where: { id },
      data: {
        name: data.name,
        servings: data.servings,
        wastePercentage: data.wastePercentage,
        instructions: data.instructions,
        ingredients: data.ingredients
          ? { deleteMany: {}, create: data.ingredients.map((ing: any) => ({ ingredientId: ing.ingredientId, quantity: ing.quantity })) }
          : undefined,
      },
      include: { ingredients: { include: { ingredient: true } } },
    })
  }

  async findRecipeByItem(menuItemId: string): Promise<any | null> {
    const client = getClient()
    return client.recipe.findFirst({
      where: { menuItemId },
      include: { ingredients: { include: { ingredient: true } } },
    })
  }

  async findManyStockMovements(tenantId: string, opts?: { limit?: number; offset?: number }): Promise<any[]> {
    const client = getClient()
    return client.stockMovement.findMany({
      where: { ingredient: { tenantId } },
      include: { ingredient: { select: { id: true, name: true, sku: true, unit: true } } },
      orderBy: { createdAt: 'desc' },
      take: opts?.limit ?? 100,
      skip: opts?.offset,
    })
  }
}
