import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { CrmService } from './crm.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class CrmController {
  private service = container.resolve(CrmService)

  async getCustomers(req: Request, res: Response) {
    const customers = await this.service.getCustomers(req.tenantId!)
    res.json({ success: true, data: customers })
  }

  async getCustomer(req: Request, res: Response) {
    const customer = await this.service.getCustomer(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: customer })
  }

  async createCustomer(req: Request, res: Response) {
    const customer = await this.service.createCustomer(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: customer })
  }

  async updateCustomer(req: Request, res: Response) {
    const customer = await this.service.updateCustomer(req.tenantId!, req.params.id as string, req.body)
    res.json({ success: true, data: customer })
  }

  async getSegments(req: Request, res: Response) {
    const segments = await this.service.getSegments(req.tenantId!)
    res.json({ success: true, data: segments })
  }

  async getLoyaltyProgram(req: Request, res: Response) {
    const program = await this.service.getLoyaltyProgram(req.tenantId!)
    res.json({ success: true, data: program })
  }

  async redeemPoints(req: Request, res: Response) {
    const result = await this.service.redeemPoints(req.tenantId!, req.body)
    res.json({ success: true, data: result })
  }

  async getRewards(req: Request, res: Response) {
    const rewards = await this.service.getRewards(req.tenantId!)
    res.json({ success: true, data: rewards })
  }
}

export const crmController = wrapAsync(new CrmController())
export { CrmController }
