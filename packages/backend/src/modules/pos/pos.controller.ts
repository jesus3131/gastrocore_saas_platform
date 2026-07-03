import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { PosService } from './pos.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class PosController {
  private service = container.resolve(PosService)

  async getMenu(req: Request, res: Response) {
    const menu = await this.service.getMenu(req.tenantId!)
    res.json({ success: true, data: menu })
  }

  async getMenuItems(req: Request, res: Response) {
    const items = await this.service.getMenuItems(req.tenantId!, req.params.categoryId as string)
    res.json({ success: true, data: items })
  }

  async getTables(req: Request, res: Response) {
    const tables = await this.service.getTables(req.tenantId!)
    res.json({ success: true, data: tables })
  }

  async updateTableStatus(req: Request, res: Response) {
    const table = await this.service.updateTableStatus(req.tenantId!, req.params.id as string, req.body.status)
    res.json({ success: true, data: table })
  }

  async getOrders(req: Request, res: Response) {
    const orders = await this.service.getOrders(req.tenantId!)
    res.json({ success: true, data: orders })
  }

  async createOrder(req: Request, res: Response) {
    const order = await this.service.createOrder(req.tenantId!, req.body, req.user!.sub)
    res.status(201).json({ success: true, data: order })
  }

  async getOrder(req: Request, res: Response) {
    const order = await this.service.getOrder(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: order })
  }

  async updateOrderStatus(req: Request, res: Response) {
    const order = await this.service.updateOrderStatus(req.tenantId!, req.params.id as string, req.body.status)
    res.json({ success: true, data: order })
  }

  async processPayment(req: Request, res: Response) {
    const payment = await this.service.processPayment(req.tenantId!, req.body)
    res.json({ success: true, data: payment })
  }

  async splitBill(req: Request, res: Response) {
    const result = await this.service.splitBill(req.tenantId!, req.body)
    res.json({ success: true, data: result })
  }
}

export const posController = wrapAsync(new PosController())
export { PosController }
