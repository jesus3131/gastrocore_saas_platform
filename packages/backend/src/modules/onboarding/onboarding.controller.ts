import type { Request, Response, NextFunction } from 'express'
import { OnboardingService } from './onboarding.service.js'

export class OnboardingController {
  private service = new OnboardingService()

  async saveProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.saveProfile(req.tenantId!, req.body)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async saveAreas(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.saveAreas(req.tenantId!, req.body)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async saveModules(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.saveModules(req.tenantId!, req.body.features)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async launch(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.launch(req.tenantId!)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await this.service.getStatus(req.tenantId!)
      res.json({ success: true, data: status })
    } catch (err) { next(err) }
  }
}
