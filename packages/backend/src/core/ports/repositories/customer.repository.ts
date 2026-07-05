import type { CrmCustomer, PaginationOpts } from '../../../core/domain/entities/index.js'

export interface CustomerRepository {
  findMany(tenantId: string, opts?: PaginationOpts): Promise<CrmCustomer[]>
  findFirst(where: any, include?: any): Promise<CrmCustomer | null>
  create(data: any): Promise<CrmCustomer>
  update(id: string, data: any): Promise<CrmCustomer>
  count(where: any): Promise<number>
  groupBy(tenantId: string, field: string): Promise<any[]>
}
