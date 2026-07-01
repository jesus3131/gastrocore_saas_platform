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
}
