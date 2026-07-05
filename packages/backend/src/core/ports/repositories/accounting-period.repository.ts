import type { AccountingPeriodEntity } from '../../../core/domain/entities/index.js'

export interface AccountingPeriodRepository {
  findMany(tenantId: string): Promise<AccountingPeriodEntity[]>
  findFirst(where: any): Promise<AccountingPeriodEntity | null>
  create(data: any): Promise<AccountingPeriodEntity>
  update(id: string, data: any): Promise<AccountingPeriodEntity>
}
