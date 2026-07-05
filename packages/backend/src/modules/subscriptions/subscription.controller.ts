import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { SubscriptionService } from './subscription.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class SubscriptionController {
  private service = container.resolve(SubscriptionService)

  async getPlans(_req: Request, res: Response) {
    const plans = await this.service.getPlans()
    res.json({ success: true, data: plans })
  }

  async getCurrentSubscription(req: Request, res: Response) {
    const subscription = await this.service.getCurrentSubscription(req.tenantId!)
    res.json({ success: true, data: subscription })
  }

  async changePlan(req: Request, res: Response) {
    const result = await this.service.changePlan(req.tenantId!, req.body.plan)
    res.json({ success: true, data: result })
  }

  async getInvoices(req: Request, res: Response) {
    const invoices = await this.service.getInvoices(req.tenantId!)
    res.json({ success: true, data: invoices })
  }
}

export const subscriptionController = wrapAsync(new SubscriptionController())
export { SubscriptionController }
