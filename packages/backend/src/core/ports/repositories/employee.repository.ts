import type { HrEmployee, Shift, Commission, PaginationOpts } from '../../../core/domain/entities/index.js'

export interface EmployeeRepository {
  create(tenantId: string, data: any): Promise<HrEmployee>
  findById(tenantId: string, id: string): Promise<HrEmployee | null>
  findMany(tenantId: string, opts?: PaginationOpts): Promise<HrEmployee[]>
  update(tenantId: string, id: string, data: any): Promise<HrEmployee>
  countActive(tenantId: string): Promise<number>

  findManyShifts(tenantId: string, opts?: PaginationOpts): Promise<Shift[]>
  createShift(data: any): Promise<Shift>
  updateShift(id: string, data: any): Promise<Shift>

  findManyCommissions(tenantId: string, opts?: PaginationOpts): Promise<Commission[]>

  findByPin(tenantId: string, pin: string, role?: string): Promise<HrEmployee | null>
}
