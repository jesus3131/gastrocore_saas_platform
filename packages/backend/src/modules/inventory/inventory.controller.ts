import type { Request, Response, NextFunction } from 'express'
import { container } from 'tsyringe'
import { InventoryService } from './inventory.service.js'

export class InventoryController {
  private service = container.resolve(InventoryService)

  async getIngredients(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset } = req.query
      const ingredients = await this.service.getIngredients(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
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
      const ingredient = await this.service.updateIngredient(req.tenantId!, req.params.id as string, req.body)
      res.json({ success: true, data: ingredient })
    } catch (err) { next(err) }
  }

  async getRecipes(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset } = req.query
      const recipes = await this.service.getRecipes(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
      res.json({ success: true, data: recipes })
    } catch (err) { next(err) }
  }

  async createRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await this.service.createRecipe(req.tenantId!, req.body)
      res.status(201).json({ success: true, data: recipe })
    } catch (err) { next(err) }
  }

  async updateRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await this.service.updateRecipe(req.tenantId!, req.params.id as string, req.body)
      res.json({ success: true, data: recipe })
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
      const { limit, offset } = req.query
      const alerts = await this.service.getStockAlerts(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
      res.json({ success: true, data: alerts })
    } catch (err) { next(err) }
  }

  async getStockMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset } = req.query
      const movements = await this.service.getStockMovements(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
      res.json({ success: true, data: movements })
    } catch (err) { next(err) }
  }
}
