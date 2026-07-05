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

  async createPaymentIntent(req: Request, res: Response) {
    const result = await this.service.createPaymentIntent(req.tenantId!, req.body)
    res.json({ success: true, data: result })
  }

  async confirmPayment(req: Request, res: Response) {
    const { provider, transactionId } = req.body
    const result = await this.service.confirmPayment(req.tenantId!, provider, transactionId)
    res.json({ success: true, data: result })
  }

  async createMpPreference(req: Request, res: Response) {
    const result = await this.service.createMpPreference(req.tenantId!, req.body)
    res.json({ success: true, data: result })
  }

  async handleStripeWebhook(req: Request, res: Response) {
    const signature = (req.headers['stripe-signature'] || '') as string
    const rawBody = (req as any).rawBody
    const result = await this.service.handleStripeWebhook(rawBody || JSON.stringify(req.body), signature)
    res.json({ received: true, type: result.type })
  }

  async handleMpNotification(req: Request, res: Response) {
    const result = await this.service.handleMpNotification(req.body)
    res.json({ success: true, data: result })
  }

  async syncDeliveryMenu(req: Request, res: Response) {
    const provider = req.params.provider as string
    const result = await this.service.syncDeliveryMenu(req.tenantId!, provider, req.body)
    res.json({ success: true, data: result })
  }

  async updateDeliveryOrderStatus(req: Request, res: Response) {
    const provider = req.params.provider as string
    const orderId = req.params.orderId as string
    const result = await this.service.updateDeliveryOrderStatus(req.tenantId!, provider, orderId, req.body.status)
    res.json({ success: true, data: result })
  }

  async handleDeliveryWebhook(req: Request, res: Response) {
    const provider = req.params.provider as string
    const result = await this.service.handleDeliveryWebhook(req.tenantId!, provider, req.body)
    res.status(201).json({ success: true, data: result })
  }

  async getDeliveryOrders(req: Request, res: Response) {
    const provider = req.params.provider as string
    const result = await this.service.getDeliveryOrders(req.tenantId!, provider)
    res.json({ success: true, data: result })
  }
}

export const integrationController = wrapAsync(new IntegrationController())
export { IntegrationController }
