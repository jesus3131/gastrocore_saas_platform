import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { WaiterService } from './waiter.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class WaiterController {
  private service = container.resolve(WaiterService)

  async login(req: Request, res: Response) {
    const tenantId = req.headers['x-tenant-id'] as string | undefined
    const result = await this.service.login(req.body.email, req.body.password, tenantId)
    res.json({ success: true, data: result })
  }

  async loginWithPin(req: Request, res: Response) {
    const result = await this.service.loginWithPin(req.body.pin, req.body.tenantSlug)
    res.json({ success: true, data: result })
  }

  async listTenants(_req: Request, res: Response) {
    const tenants = await this.service.listTenants()
    res.json({ success: true, data: tenants })
  }

  async getMenu(req: Request, res: Response) {
    const menu = await this.service.getMenu(req.tenantId!)
    res.json({ success: true, data: menu })
  }

  async getTables(req: Request, res: Response) {
    const tables = await this.service.getTables(req.tenantId!, req.user!.branchId)
    res.json({ success: true, data: tables })
  }

  async createOrder(req: Request, res: Response) {
    const order = await this.service.createOrder(req.tenantId!, req.body, req.user!.sub)
    res.status(201).json({ success: true, data: order })
  }

  async requestBill(req: Request, res: Response) {
    const order = await this.service.requestBill(req.tenantId!, req.params.tableId as string)
    res.json({ success: true, data: order })
  }

  async processPayment(req: Request, res: Response) {
    const result = await this.service.processPayment(req.tenantId!, req.params.tableId as string, req.body)
    res.json({ success: true, data: result })
  }
}

export const waiterController = wrapAsync(new WaiterController())
export { WaiterController }
