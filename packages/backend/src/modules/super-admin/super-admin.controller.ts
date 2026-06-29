import type { Request, Response, NextFunction } from 'express'
import { SuperAdminService } from './super-admin.service.js'

export class SuperAdminController {
  private service = new SuperAdminService()

  async getCompanies(_req: Request, res: Response, next: NextFunction) {
    try {
      const companies = await this.service.getCompanies()
      res.json({ success: true, data: companies })
    } catch (err) { next(err) }
  }

  async getCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await this.service.getCompany(req.params.id as string)
      res.json({ success: true, data: company })
    } catch (err) { next(err) }
  }

  async createCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createCompany(req.body)
      res.status(201).json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async resendCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.resendCredentials(req.params.id as string)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }
}
