import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { MenuService } from './menu.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class MenuController {
  private service = container.resolve(MenuService)

  async getFullMenu(req: Request, res: Response) {
    const menu = await this.service.getFullMenu(req.tenantId!)
    res.json({ success: true, data: menu })
  }

  async getCategory(req: Request, res: Response) {
    const cat = await this.service.getCategoryById(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: cat })
  }

  async createCategory(req: Request, res: Response) {
    const cat = await this.service.createCategory(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: cat })
  }

  async updateCategory(req: Request, res: Response) {
    const cat = await this.service.updateCategory(req.tenantId!, req.params.id as string, req.body)
    res.json({ success: true, data: cat })
  }

  async deleteCategory(req: Request, res: Response) {
    await this.service.deleteCategory(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: null })
  }

  async getItem(req: Request, res: Response) {
    const item = await this.service.getItemById(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: item })
  }

  async createItem(req: Request, res: Response) {
    const item = await this.service.createItem(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: item })
  }

  async updateItem(req: Request, res: Response) {
    const item = await this.service.updateItem(req.tenantId!, req.params.id as string, req.body)
    res.json({ success: true, data: item })
  }

  async deleteItem(req: Request, res: Response) {
    await this.service.deleteItem(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: null })
  }
}

export const menuController = wrapAsync(new MenuController())
export { MenuController }
