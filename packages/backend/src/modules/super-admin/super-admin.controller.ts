import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { SuperAdminService } from './super-admin.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

function getAdminId(req: Request): string {
  return req.user!.sub
}

class SuperAdminController {
  private service = container.resolve(SuperAdminService)

  async getCompanies(_req: Request, res: Response) {
    const companies = await this.service.getCompanies()
    res.json({ success: true, data: companies })
  }

  async getCompany(req: Request, res: Response) {
    const company = await this.service.getCompany(req.params.id as string)
    res.json({ success: true, data: company })
  }

  async createCompany(req: Request, res: Response) {
    const result = await this.service.createCompany(req.body)
    res.status(201).json({ success: true, data: result })
  }

  async updateCompany(req: Request, res: Response) {
    const result = await this.service.updateCompany(req.params.id as string, req.body)
    res.json({ success: true, data: result })
  }

  async updateModules(req: Request, res: Response) {
    const result = await this.service.updateModules(req.params.id as string, req.body.features)
    res.json({ success: true, data: result })
  }

  async resendCredentials(req: Request, res: Response) {
    const result = await this.service.resendCredentials(req.params.id as string)
    res.json({ success: true, data: result })
  }

  async deleteCompany(req: Request, res: Response) {
    const result = await this.service.deleteCompany(req.params.id as string, getAdminId(req))
    res.json({ success: true, data: result })
  }

  async migratePlan(req: Request, res: Response) {
    const result = await this.service.migratePlan(req.params.id as string, req.body.planId)
    res.json({ success: true, data: result })
  }

  async toggleTenantStatus(req: Request, res: Response) {
    const result = await this.service.toggleTenantStatus(req.params.id as string)
    res.json({ success: true, data: result })
  }

  async getDashboardMetrics(_req: Request, res: Response) {
    const result = await this.service.getDashboardMetrics()
    res.json({ success: true, data: result })
  }

  async getInvoices(req: Request, res: Response) {
    const result = await this.service.getInvoices({
      tenantId: req.query.tenantId as string,
      status: req.query.status as string,
    })
    res.json({ success: true, data: result })
  }

  async markInvoicePaid(req: Request, res: Response) {
    const result = await this.service.markInvoicePaid(req.params.id as string, getAdminId(req), req.body.paymentMethod)
    res.json({ success: true, data: result })
  }

  async createManualInvoice(req: Request, res: Response) {
    const result = await this.service.createManualInvoice({ ...req.body, adminId: getAdminId(req) })
    res.status(201).json({ success: true, data: result })
  }

  async getCalendarEvents(req: Request, res: Response) {
    const result = await this.service.getCalendarEvents(req.query.dateFrom as string, req.query.dateTo as string)
    res.json({ success: true, data: result })
  }

  async createCalendarEvent(req: Request, res: Response) {
    const result = await this.service.createCalendarEvent({ ...req.body, createdBy: getAdminId(req) })
    res.status(201).json({ success: true, data: result })
  }

  async deleteCalendarEvent(req: Request, res: Response) {
    const result = await this.service.deleteCalendarEvent(req.params.id as string, getAdminId(req))
    res.json({ success: true, data: result })
  }

  async getPlans(_req: Request, res: Response) {
    const plans = await this.service.getPlans()
    res.json({ success: true, data: plans })
  }

  async getSystemHealth(_req: Request, res: Response) {
    const health = await this.service.getSystemHealth()
    res.json({ success: true, data: health })
  }

  async createAnnouncement(req: Request, res: Response) {
    const result = await this.service.createAnnouncement({ ...req.body, adminId: getAdminId(req) })
    res.status(201).json({ success: true, data: result })
  }

  async getFeatureFlags(_req: Request, res: Response) {
    const result = await this.service.getFeatureFlags()
    res.json({ success: true, data: result })
  }

  async updateFeatureFlag(req: Request, res: Response) {
    const result = await this.service.updateFeatureFlag(req.body)
    res.json({ success: true, data: result })
  }

  async toggleAllFeatureFlags(req: Request, res: Response) {
    const result = await this.service.toggleAllFeatureFlags(req.body.enabled)
    res.json({ success: true, data: result })
  }

  async getAuditLogs(req: Request, res: Response) {
    const result = await this.service.getAuditLogs({
      severity: req.query.severity as string,
      action: req.query.action as string,
      adminId: req.query.adminId as string,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    })
    res.json({ success: true, data: result })
  }
}

export const superAdminController = wrapAsync(new SuperAdminController())
export { SuperAdminController }
