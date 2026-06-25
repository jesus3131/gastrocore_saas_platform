import type { Request, Response, NextFunction } from 'express'
import { SubscriptionService } from './subscription.service.js'

export class SubscriptionController {
  private service = new SubscriptionService()

  async getPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await this.service.getPlans()
      res.json({ success: true, data: plans })
    } catch (err) { next(err) }
  }

  async getCurrentSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await this.service.getCurrentSubscription(req.tenantId!)
      res.json({ success: true, data: subscription })
    } catch (err) { next(err) }
  }

  async changePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.changePlan(req.tenantId!, req.body.plan)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await this.service.getInvoices(req.tenantId!)
      res.json({ success: true, data: invoices })
    } catch (err) { next(err) }
  }
}
