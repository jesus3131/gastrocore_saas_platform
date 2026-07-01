import type { Request, Response, NextFunction } from 'express'
import { container } from 'tsyringe'
import { PosService } from './pos.service.js'

export class PosController {
  private service = container.resolve(PosService)

  async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const menu = await this.service.getMenu(req.tenantId!)
      res.json({ success: true, data: menu })
    } catch (err) { next(err) }
  }

  async getMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await this.service.getMenuItems(req.tenantId!, req.params.categoryId as string)
      res.json({ success: true, data: items })
    } catch (err) { next(err) }
  }

  async getTables(req: Request, res: Response, next: NextFunction) {
    try {
      const tables = await this.service.getTables(req.tenantId!)
      res.json({ success: true, data: tables })
    } catch (err) { next(err) }
  }

  async updateTableStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const table = await this.service.updateTableStatus(req.params.id as string, req.body.status)
      res.json({ success: true, data: table })
    } catch (err) { next(err) }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await this.service.getOrders(req.tenantId!)
      res.json({ success: true, data: orders })
    } catch (err) { next(err) }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await this.service.createOrder(req.tenantId!, req.body, req.user!.sub)
      res.status(201).json({ success: true, data: order })
    } catch (err) { next(err) }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await this.service.getOrder(req.tenantId!, req.params.id as string)
      res.json({ success: true, data: order })
    } catch (err) { next(err) }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await this.service.updateOrderStatus(req.tenantId!, req.params.id as string, req.body.status)
      res.json({ success: true, data: order })
    } catch (err) { next(err) }
  }

  async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await this.service.processPayment(req.tenantId!, req.body)
      res.json({ success: true, data: payment })
    } catch (err) { next(err) }
  }

  async splitBill(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.splitBill(req.tenantId!, req.body)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }
}