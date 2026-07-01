import type { Request, Response, NextFunction } from 'express'
import { container } from 'tsyringe'
import { SuperAdminService } from './super-admin.service.js'

export class SuperAdminController {
  private service = container.resolve(SuperAdminService)

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

  async updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.updateCompany(req.params.id as string, req.body)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async updateModules(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.updateModules(req.params.id as string, req.body.features)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async resendCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.resendCredentials(req.params.id as string)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }
}
