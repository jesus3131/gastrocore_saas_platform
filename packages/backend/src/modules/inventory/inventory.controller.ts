import type { Request, Response, NextFunction } from 'express'
import { InventoryService } from './inventory.service.js'

export class InventoryController {
  private service = new InventoryService()

  async getIngredients(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredients = await this.service.getIngredients(req.tenantId!)
      res.json({ success: true, data: ingredients })
    } catch (err) { next(err) }
  }

  async createIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredient = await this.service.createIngredient(req.tenantId!, req.body)
      res.status(201).json({ success: true, data: ingredient })
    } catch (err) { next(err) }
  }

  async updateIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredient = await this.service.updateIngredient(req.params.id as string, req.body)
      res.json({ success: true, data: ingredient })
    } catch (err) { next(err) }
  }

  async getRecipes(req: Request, res: Response, next: NextFunction) {
    try {
      const recipes = await this.service.getRecipes(req.tenantId!)
      res.json({ success: true, data: recipes })
    } catch (err) { next(err) }
  }

  async createRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await this.service.createRecipe(req.tenantId!, req.body)
      res.status(201).json({ success: true, data: recipe })
    } catch (err) { next(err) }
  }

  async getRecipeByItem(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await this.service.getRecipeByItem(req.params.menuItemId as string)
      res.json({ success: true, data: recipe })
    } catch (err) { next(err) }
  }

  async getStockAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await this.service.getStockAlerts(req.tenantId!)
      res.json({ success: true, data: alerts })
    } catch (err) { next(err) }
  }

  async getStockMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const movements = await this.service.getStockMovements(req.tenantId!)
      res.json({ success: true, data: movements })
    } catch (err) { next(err) }
  }
}
