import type { Request, Response, NextFunction } from 'express'
import { AnalyticsService } from './analytics.service.js'

export class AnalyticsController {
  private service = new AnalyticsService()

  async getSalesSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await this.service.getSalesSummary(req.tenantId!)
      res.json({ success: true, data: summary })
    } catch (err) { next(err) }
  }

  async getBcgMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const matrix = await this.service.getBcgMatrix(req.tenantId!)
      res.json({ success: true, data: matrix })
    } catch (err) { next(err) }
  }

  async getPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const performance = await this.service.getPerformance(req.tenantId!)
      res.json({ success: true, data: performance })
    } catch (err) { next(err) }
  }

  async getPeakHours(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getPeakHours(req.tenantId!)
      res.json({ success: true, data })
    } catch (err) { next(err) }
  }

  async getMultiBranchReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await this.service.getMultiBranchReport(req.tenantId!)
      res.json({ success: true, data: report })
    } catch (err) { next(err) }
  }
}
