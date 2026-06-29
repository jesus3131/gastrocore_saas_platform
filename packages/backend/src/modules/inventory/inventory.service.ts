import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'

export class InventoryService {
  async getIngredients(tenantId: string) {
    return prisma.ingredient.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    })
  }

  async createIngredient(tenantId: string, data: any) {
    return prisma.ingredient.create({
      data: { ...data, tenantId },
    })
  }

  async updateIngredient(tenantId: string, id: string, data: any) {
    const ingredient = await prisma.ingredient.findFirst({ where: { tenantId, id } })
    if (!ingredient) throw new AppError(404, 'INGREDIENT_NOT_FOUND', 'Ingredient not found')
    return prisma.ingredient.update({ where: { id }, data })
  }

  async getRecipes(tenantId: string) {
    return prisma.recipe.findMany({
      where: { menuItem: { tenantId } },
      include: {
        menuItem: true,
        ingredients: {
          include: { ingredient: true },
        },
      },
    })
  }

  async createRecipe(tenantId: string, data: any) {
    // Calculate total cost
    let totalCost = 0
    const ingredientsData = []

    for (const ing of data.ingredients) {
      const ingredient = await prisma.ingredient.findFirst({
        where: { tenantId, id: ing.ingredientId },
      })
      if (!ingredient) continue

      const ingCost = Number(ingredient.unitCost) * Number(ing.quantity)
      totalCost += ingCost

      ingredientsData.push({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
      })
    }

    return prisma.recipe.create({
      data: {
        menuItemId: data.menuItemId,
        name: data.name,
        servings: data.servings || 1,
        wastePercentage: data.wastePercentage || 0,
        instructions: data.instructions,
        ingredients: { create: ingredientsData },
      },
      include: { ingredients: { include: { ingredient: true } } },
    })
  }

  async updateRecipe(tenantId: string, id: string, data: any) {
    const existing = await prisma.recipe.findFirst({
      where: { id, menuItem: { tenantId } },
      include: { ingredients: true },
    })
    if (!existing) throw new AppError(404, 'RECIPE_NOT_FOUND', 'Recipe not found')

    // Recalculate total cost if ingredients provided
    let totalCost = 0
    if (data.ingredients) {
      for (const ing of data.ingredients) {
        const ingredient = await prisma.ingredient.findFirst({
          where: { tenantId, id: ing.ingredientId },
        })
        if (!ingredient) continue
        totalCost += Number(ingredient.unitCost) * Number(ing.quantity)
      }

      // Delete old ingredients and create new ones
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } })
    }

    const { ingredients, ...recipeData } = data

    return prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        ...(ingredients
          ? { ingredients: { create: ingredients.map((i: any) => ({ ingredientId: i.ingredientId, quantity: i.quantity })) } }
          : {}),
      },
      include: { ingredients: { include: { ingredient: true } }, menuItem: true },
    })
  }

  async getRecipeByItem(menuItemId: string) {
    const recipe = await prisma.recipe.findFirst({
      where: { menuItemId },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    })
    if (!recipe) throw new AppError(404, 'RECIPE_NOT_FOUND', 'Recipe not found')

    // Calculate cost
    let totalCost = 0
    for (const ing of recipe.ingredients) {
      totalCost += Number(ing.ingredient.unitCost) * Number(ing.quantity)
    }

    return { ...recipe, totalCost, suggestedPrice: totalCost * 3.5 }
  }

  async getStockAlerts(tenantId: string) {
    const ingredients = await prisma.ingredient.findMany({
      where: { tenantId, isActive: true },
      orderBy: { currentStock: 'asc' },
    })
    return ingredients.filter((i) => Number(i.currentStock) <= Number(i.minimumStock))
  }

  async getStockMovements(tenantId: string) {
    return prisma.stockMovement.findMany({
      where: { ingredient: { tenantId } },
      include: { ingredient: { select: { id: true, name: true, sku: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }
}
