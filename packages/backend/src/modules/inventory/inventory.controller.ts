import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { InventoryService } from './inventory.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class InventoryController {
  private service = container.resolve(InventoryService)

  async getIngredients(req: Request, res: Response) {
    const { limit, offset } = req.query
    const ingredients = await this.service.getIngredients(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
    res.json({ success: true, data: ingredients })
  }

  async createIngredient(req: Request, res: Response) {
    const ingredient = await this.service.createIngredient(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: ingredient })
  }

  async updateIngredient(req: Request, res: Response) {
    const ingredient = await this.service.updateIngredient(req.tenantId!, req.params.id as string, req.body)
    res.json({ success: true, data: ingredient })
  }

  async getRecipes(req: Request, res: Response) {
    const { limit, offset } = req.query
    const recipes = await this.service.getRecipes(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
    res.json({ success: true, data: recipes })
  }

  async createRecipe(req: Request, res: Response) {
    const recipe = await this.service.createRecipe(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: recipe })
  }

  async updateRecipe(req: Request, res: Response) {
    const recipe = await this.service.updateRecipe(req.tenantId!, req.params.id as string, req.body)
    res.json({ success: true, data: recipe })
  }

  async getRecipeByItem(req: Request, res: Response) {
    const recipe = await this.service.getRecipeByItem(req.params.menuItemId as string, req.tenantId!)
    res.json({ success: true, data: recipe })
  }

  async getStockAlerts(req: Request, res: Response) {
    const { limit, offset } = req.query
    const alerts = await this.service.getStockAlerts(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
    res.json({ success: true, data: alerts })
  }

  async getStockMovements(req: Request, res: Response) {
    const { limit, offset } = req.query
    const movements = await this.service.getStockMovements(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
    res.json({ success: true, data: movements })
  }
}

export const inventoryController = wrapAsync(new InventoryController())
export { InventoryController }
