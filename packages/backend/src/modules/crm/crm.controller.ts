import type { Request, Response, NextFunction } from 'express'
import { CrmService } from './crm.service.js'

export class CrmController {
  private service = new CrmService()

  async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await this.service.getCustomers(req.tenantId!)
      res.json({ success: true, data: customers })
    } catch (err) { next(err) }
  }

  async getCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await this.service.getCustomer(req.params.id as string)
      res.json({ success: true, data: customer })
    } catch (err) { next(err) }
  }

  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await this.service.createCustomer(req.tenantId!, req.body)
      res.status(201).json({ success: true, data: customer })
    } catch (err) { next(err) }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await this.service.updateCustomer(req.params.id as string, req.body)
      res.json({ success: true, data: customer })
    } catch (err) { next(err) }
  }

  async getSegments(req: Request, res: Response, next: NextFunction) {
    try {
      const segments = await this.service.getSegments(req.tenantId!)
      res.json({ success: true, data: segments })
    } catch (err) { next(err) }
  }

  async getLoyaltyProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const program = await this.service.getLoyaltyProgram(req.tenantId!)
      res.json({ success: true, data: program })
    } catch (err) { next(err) }
  }

  async redeemPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.redeemPoints(req.tenantId!, req.body)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async getRewards(req: Request, res: Response, next: NextFunction) {
    try {
      const rewards = await this.service.getRewards(req.tenantId!)
      res.json({ success: true, data: rewards })
    } catch (err) { next(err) }
  }
}
