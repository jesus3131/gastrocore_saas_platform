import type { Request, Response, NextFunction } from 'express'
import { container } from 'tsyringe'
import { SuperAdminService } from './super-admin.service.js'

function getAdminId(req: Request): string {
  return req.user!.sub
}

export class SuperAdminController {
  private service = container.resolve(SuperAdminService)

  // ─── COMPANIES ─────────────────────────────────────────────────

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

  async deleteCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.deleteCompany(req.params.id as string, getAdminId(req))
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async migratePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.migratePlan(req.params.id as string, req.body.planId)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async toggleTenantStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.toggleTenantStatus(req.params.id as string)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  // ─── DASHBOARD ─────────────────────────────────────────────────

  async getDashboardMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.getDashboardMetrics()
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  // ─── INVOICES ──────────────────────────────────────────────────

  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.getInvoices({
        tenantId: req.query.tenantId as string,
        status: req.query.status as string,
      })
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async markInvoicePaid(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.markInvoicePaid(
        req.params.id as string,
        getAdminId(req),
        req.body.paymentMethod,
      )
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async createManualInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createManualInvoice({ ...req.body, adminId: getAdminId(req) })
      res.status(201).json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  // ─── CALENDAR ──────────────────────────────────────────────────

  async getCalendarEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.getCalendarEvents(
        req.query.dateFrom as string,
        req.query.dateTo as string,
      )
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async createCalendarEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createCalendarEvent({ ...req.body, createdBy: getAdminId(req) })
      res.status(201).json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async deleteCalendarEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.deleteCalendarEvent(req.params.id as string, getAdminId(req))
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  // ─── PLANS ─────────────────────────────────────────────────────

  async getPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await this.service.getPlans()
      res.json({ success: true, data: plans })
    } catch (err) { next(err) }
  }

  // ─── SYSTEM HEALTH ─────────────────────────────────────────────

  async getSystemHealth(_req: Request, res: Response, next: NextFunction) {
    try {
      const health = await this.service.getSystemHealth()
      res.json({ success: true, data: health })
    } catch (err) { next(err) }
  }

  // ─── ANNOUNCEMENTS ─────────────────────────────────────────────

  async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createAnnouncement({ ...req.body, adminId: getAdminId(req) })
      res.status(201).json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  // ─── AUDIT ─────────────────────────────────────────────────────

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.getAuditLogs({
        severity: req.query.severity as string,
        action: req.query.action as string,
        adminId: req.query.adminId as string,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      })
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }
}
