import type { Request, Response, NextFunction } from 'express'
import { container } from 'tsyringe'
import { IntegrationService } from './integration.service.js'

export class IntegrationController {
  private service = container.resolve(IntegrationService)

  async getDeliveries(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.getDeliveries(req.tenantId!)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.getPayments(req.tenantId!)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async connectDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.connectDelivery(req.tenantId!, req.body)
      res.status(201).json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async connectPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.connectPayment(req.tenantId!, req.body)
      res.status(201).json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async toggleIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.toggleIntegration(req.tenantId!, req.params.id as string, req.body)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.disconnect(req.tenantId!, req.params.id as string)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.handleWebhook(req.body)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }
}
