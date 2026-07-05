import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { HrService } from './hr.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class HrController {
  private service = container.resolve(HrService)

  async getEmployees(req: Request, res: Response) {
    const { limit, offset } = req.query
    const employees = await this.service.getEmployees(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
    res.json({ success: true, data: employees })
  }

  async createEmployee(req: Request, res: Response) {
    const employee = await this.service.createEmployee(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: employee })
  }

  async updateEmployee(req: Request, res: Response) {
    const employee = await this.service.updateEmployee(req.tenantId!, req.params.id as string, req.body)
    res.json({ success: true, data: employee })
  }

  async deleteEmployee(req: Request, res: Response) {
    await this.service.deleteEmployee(req.tenantId!, req.params.id as string, req.user!.sub)
    res.json({ success: true, data: { message: 'Employee deleted successfully' } })
  }

  async getShifts(req: Request, res: Response) {
    const { limit, offset } = req.query
    const shifts = await this.service.getShifts(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
    res.json({ success: true, data: shifts })
  }

  async createShift(req: Request, res: Response) {
    const shift = await this.service.createShift(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: shift })
  }

  async updateShiftStatus(req: Request, res: Response) {
    const shift = await this.service.updateShiftStatus(req.tenantId!, req.params.id as string, req.body.status)
    res.json({ success: true, data: shift })
  }

  async verifyPin(req: Request, res: Response) {
    const result = await this.service.verifyPin(req.tenantId!, req.body.pin, req.body.role)
    res.json({ success: true, data: result })
  }

  async getRoles(req: Request, res: Response) {
    const roles = await this.service.getRoles()
    res.json({ success: true, data: roles })
  }

  async getCommissions(req: Request, res: Response) {
    const { limit, offset } = req.query
    const commissions = await this.service.getCommissions(req.tenantId!, { limit: Number(limit) || undefined, offset: Number(offset) || undefined })
    res.json({ success: true, data: commissions })
  }
}

export const hrController = wrapAsync(new HrController())
export { HrController }
