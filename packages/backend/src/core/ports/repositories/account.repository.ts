import type { AccountEntry } from '../../../core/domain/entities/index.js'

export interface AccountRepository {
  findMany(tenantId: string, opts?: any): Promise<AccountEntry[]>
  findFirst(where: any, include?: any): Promise<AccountEntry | null>
  create(data: any): Promise<AccountEntry>
  createMany(data: any[]): Promise<AccountEntry[]>
  update(id: string, data: any): Promise<AccountEntry>
  delete(id: string): Promise<AccountEntry>
  count(where: any): Promise<number>
}
