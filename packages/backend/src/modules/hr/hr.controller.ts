import type { Request, Response, NextFunction } from 'express'
import { container } from 'tsyringe'
import { HrService } from './hr.service.js'

export class HrController {
  private service = container.resolve(HrService)

  async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset } = req.query
      const employees = await this.service.getEmployees(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
      res.json({ success: true, data: employees })
    } catch (err) { next(err) }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await this.service.createEmployee(req.tenantId!, req.body)
      res.status(201).json({ success: true, data: employee })
    } catch (err) { next(err) }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await this.service.updateEmployee(req.tenantId!, req.params.id as string, req.body)
      res.json({ success: true, data: employee })
    } catch (err) { next(err) }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.deleteEmployee(req.tenantId!, req.params.id as string, req.user!.sub)
      res.json({ success: true, data: { message: 'Employee deleted successfully' } })
    } catch (err) { next(err) }
  }

  async getShifts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset } = req.query
      const shifts = await this.service.getShifts(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
      res.json({ success: true, data: shifts })
    } catch (err) { next(err) }
  }

  async createShift(req: Request, res: Response, next: NextFunction) {
    try {
      const shift = await this.service.createShift(req.tenantId!, req.body)
      res.status(201).json({ success: true, data: shift })
    } catch (err) { next(err) }
  }

  async updateShiftStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const shift = await this.service.updateShiftStatus(req.tenantId!, req.params.id as string, req.body.status)
      res.json({ success: true, data: shift })
    } catch (err) { next(err) }
  }

  async verifyPin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.verifyPin(req.tenantId!, req.body.pin, req.body.role)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await this.service.getRoles()
      res.json({ success: true, data: roles })
    } catch (err) { next(err) }
  }

  async getCommissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset } = req.query
      const commissions = await this.service.getCommissions(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
      res.json({ success: true, data: commissions })
    } catch (err) { next(err) }
  }
}
