import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { AnalyticsService } from './analytics.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class AnalyticsController {
  private service = container.resolve(AnalyticsService)

  async getSalesSummary(req: Request, res: Response) {
    const summary = await this.service.getSalesSummary(req.tenantId!)
    res.json({ success: true, data: summary })
  }

  async getBcgMatrix(req: Request, res: Response) {
    const matrix = await this.service.getBcgMatrix(req.tenantId!)
    res.json({ success: true, data: matrix })
  }

  async getPerformance(req: Request, res: Response) {
    const performance = await this.service.getPerformance(req.tenantId!)
    res.json({ success: true, data: performance })
  }

  async getPeakHours(req: Request, res: Response) {
    const data = await this.service.getPeakHours(req.tenantId!)
    res.json({ success: true, data })
  }

  async getMultiBranchReport(req: Request, res: Response) {
    const report = await this.service.getMultiBranchReport(req.tenantId!)
    res.json({ success: true, data: report })
  }
}

export const analyticsController = wrapAsync(new AnalyticsController())
export { AnalyticsController }
