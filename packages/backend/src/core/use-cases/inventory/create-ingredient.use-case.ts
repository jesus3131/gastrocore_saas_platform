import { injectable, inject } from 'tsyringe'
import type { InventoryRepository } from '../../ports/repositories/inventory.repository.js'

@injectable()
export class CreateIngredientUseCase {
  constructor(
    @inject('InventoryRepository') private readonly inventoryRepo: InventoryRepository,
  ) {}

  async execute(tenantId: string, data: any) {
    const { prisma } = await import('../../../config/database/prisma.js')
    return prisma.ingredient.create({ data: { ...data, tenantId } })
  }
}
