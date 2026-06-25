import type { Request, Response, NextFunction } from 'express'
import { HrService } from './hr.service.js'

export class HrController {
  private service = new HrService()

  async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const employees = await this.service.getEmployees(req.tenantId!)
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
      const employee = await this.service.updateEmployee(req.params.id as string, req.body)
      res.json({ success: true, data: employee })
    } catch (err) { next(err) }
  }

  async getShifts(req: Request, res: Response, next: NextFunction) {
    try {
      const shifts = await this.service.getShifts(req.tenantId!)
      res.json({ success: true, data: shifts })
    } catch (err) { next(err) }
  }

  async createShift(req: Request, res: Response, next: NextFunction) {
    try {
      const shift = await this.service.createShift(req.body)
      res.status(201).json({ success: true, data: shift })
    } catch (err) { next(err) }
  }

  async updateShiftStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const shift = await this.service.updateShiftStatus(req.params.id as string, req.body.status)
      res.json({ success: true, data: shift })
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
      const commissions = await this.service.getCommissions(req.tenantId!)
      res.json({ success: true, data: commissions })
    } catch (err) { next(err) }
  }
}
