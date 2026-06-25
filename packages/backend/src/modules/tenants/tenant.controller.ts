import type { Request, Response, NextFunction } from 'express'
import { TenantService } from './tenant.service.js'

export class TenantController {
  private service = new TenantService()

  async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await this.service.getConfig(req.tenantId!)
      res.json({ success: true, data: config })
    } catch (err) { next(err) }
  }

  async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await this.service.updateConfig(req.tenantId!, req.body)
      res.json({ success: true, data: config })
    } catch (err) { next(err) }
  }

  async updateFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const features = await this.service.updateFeatures(req.tenantId!, req.body.features)
      res.json({ success: true, data: features })
    } catch (err) { next(err) }
  }

  async getFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const features = await this.service.getFeatures(req.tenantId!)
      res.json({ success: true, data: features })
    } catch (err) { next(err) }
  }

}
