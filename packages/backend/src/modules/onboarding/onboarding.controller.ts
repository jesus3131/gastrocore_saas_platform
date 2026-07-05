import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { OnboardingService } from './onboarding.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class OnboardingController {
  private service = container.resolve(OnboardingService)

  async saveProfile(req: Request, res: Response) {
    const result = await this.service.saveProfile(req.tenantId!, req.body)
    res.json({ success: true, data: result })
  }

  async saveAreas(req: Request, res: Response) {
    const result = await this.service.saveAreas(req.tenantId!, req.body)
    res.json({ success: true, data: result })
  }

  async saveModules(req: Request, res: Response) {
    const result = await this.service.saveModules(req.tenantId!, req.body.features)
    res.json({ success: true, data: result })
  }

  async launch(req: Request, res: Response) {
    const result = await this.service.launch(req.tenantId!)
    res.json({ success: true, data: result })
  }

  async getStatus(req: Request, res: Response) {
    const status = await this.service.getStatus(req.tenantId!)
    res.json({ success: true, data: status })
  }
}

export const onboardingController = wrapAsync(new OnboardingController())
export { OnboardingController }
