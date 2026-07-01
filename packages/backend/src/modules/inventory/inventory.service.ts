import { prisma } from '../../config/database/prisma.js'
import { CreateIngredientUseCase } from '../../core/use-cases/inventory/create-ingredient.use-case.js'

export class InventoryService {
  constructor(private readonly createIngredientUseCase?: CreateIngredientUseCase) {}

  async getIngredients(tenantId: string) {
    return prisma.ingredient.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    })
  }

  async createIngredient(tenantId: string, data: any) {
    if (this.createIngredientUseCase) {
      return this.createIngredientUseCase.execute(tenantId, data)
    }
    return prisma.ingredient.create({ data: { ...data, tenantId } })
  }

  async updateIngredient(tenantId: string, id: string, data: any) {
    const ingredient = await prisma.ingredient.findFirst({ where: { tenantId, id } })
    if (!ingredient) {
      const { AppError } = await import('../../common/filters/error-handler.js')
      throw new AppError(404, 'INGREDIENT_NOT_FOUND', 'Ingredient not found')
    }
    return prisma.ingredient.update({ where: { id }, data })
  }

  async getRecipes(tenantId: string) {
    return prisma.recipe.findMany({
      where: { menuItem: { tenantId } },
      include: { ingredients: { include: { ingredient: true } }, menuItem: true },
    })
  }

  async createRecipe(tenantId: string, data: any) {
    return prisma.recipe.create({
      data: {
        menuItemId: data.menuItemId,
        name: data.name,
        servings: data.servings || 1,
        wastePercentage: data.wastePercentage || 0,
        instructions: data.instructions,
        ingredients: {
          create: data.ingredients.map((ing: any) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
          })),
        },
      },
      include: { ingredients: { include: { ingredient: true } } },
    })
  }

  async updateRecipe(tenantId: string, id: string, data: any) {
    return prisma.recipe.update({
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

  async getRecipeByItem(menuItemId: string) {
    const recipe = await prisma.recipe.findFirst({
      where: { menuItemId },
      include: { ingredients: { include: { ingredient: true } } },
    })
    if (!recipe) return null

    const totalCost = recipe.ingredients.reduce(
      (sum, ri) => sum + Number(ri.ingredient.unitCost) * Number(ri.quantity),
      0,
    )

    return { ...recipe, totalCost }
  }

  async getStockAlerts(tenantId: string) {
    return prisma.ingredient.findMany({
      where: { tenantId, currentStock: { lte: prisma.ingredient.fields.minimumStock } },
      orderBy: { currentStock: 'asc' },
    })
  }

  async getStockMovements(tenantId: string) {
    return prisma.stockMovement.findMany({
      where: { ingredient: { tenantId } },
      include: { ingredient: { select: { id: true, name: true, sku: true, unit: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }
}
