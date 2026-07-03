import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { TenantService } from './tenant.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class TenantController {
  private service = container.resolve(TenantService)

  async getConfig(req: Request, res: Response) {
    const config = await this.service.getConfig(req.tenantId!)
    res.json({ success: true, data: config })
  }

  async updateConfig(req: Request, res: Response) {
    const config = await this.service.updateConfig(req.tenantId!, req.body)
    res.json({ success: true, data: config })
  }

  async updateFeatures(req: Request, res: Response) {
    const features = await this.service.updateFeatures(req.tenantId!, req.body.features)
    res.json({ success: true, data: features })
  }

  async getFeatures(req: Request, res: Response) {
    const features = await this.service.getFeatures(req.tenantId!)
    res.json({ success: true, data: features })
  }
}

export const tenantController = wrapAsync(new TenantController())
export { TenantController }
