import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { IntegrationService } from './integration.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class IntegrationController {
  private service = container.resolve(IntegrationService)

  async getDeliveries(req: Request, res: Response) {
    const result = await this.service.getDeliveries(req.tenantId!)
    res.json({ success: true, data: result })
  }

  async getPayments(req: Request, res: Response) {
    const result = await this.service.getPayments(req.tenantId!)
    res.json({ success: true, data: result })
  }

  async connectDelivery(req: Request, res: Response) {
    const result = await this.service.connectDelivery(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: result })
  }

  async connectPayment(req: Request, res: Response) {
    const result = await this.service.connectPayment(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: result })
  }

  async toggleIntegration(req: Request, res: Response) {
    const result = await this.service.toggleIntegration(req.tenantId!, req.params.id as string, req.body)
    res.json({ success: true, data: result })
  }

  async disconnect(req: Request, res: Response) {
    const result = await this.service.disconnect(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: result })
  }

  async handleWebhook(req: Request, res: Response) {
    const result = await this.service.handleWebhook(req.body)
    res.json({ success: true, data: result })
  }
}

export const integrationController = wrapAsync(new IntegrationController())
export { IntegrationController }
