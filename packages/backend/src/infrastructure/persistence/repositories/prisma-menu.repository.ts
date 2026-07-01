import { prisma } from '../../../config/database/prisma.js'
import type { MenuRepository, RecipeWithIngredients } from '../../../core/ports/repositories/menu.repository.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaMenuRepository implements MenuRepository {
  async findRecipeByMenuItem(menuItemId: string): Promise<RecipeWithIngredients | null> {
    const client = getClient()
    const recipe = await client.recipe.findFirst({
      where: { menuItemId },
      include: {
        ingredients: {
          include: { ingredient: { select: { name: true, unit: true } } },
        },
      },
    })
    if (!recipe) return null
    return {
      id: recipe.id,
      menuItemId: recipe.menuItemId,
      name: recipe.name,
      servings: recipe.servings,
      ingredients: recipe.ingredients.map((ri: any) => ({
        ingredientId: ri.ingredientId,
        quantity: Number(ri.quantity),
        name: ri.ingredient.name,
        unit: ri.ingredient.unit,
      })),
    }
  }

  async getMenu(tenantId: string): Promise<any[]> {
    const client = getClient()
    return client.menuCategory.findMany({
      where: { tenantId, isActive: true },
      include: {
        menuItems: { where: { available: true }, orderBy: { sortOrder: 'asc' } },
        modifiers: { include: { options: { orderBy: { sortOrder: 'asc' } } } },
      },
      orderBy: { sortOrder: 'asc' },
    })
  }

  async getMenuItems(tenantId: string, categoryId: string): Promise<any[]> {
    const client = getClient()
    return client.menuItem.findMany({
      where: { tenantId, categoryId, available: true },
      orderBy: { sortOrder: 'asc' },
    })
  }
}
