import type { JournalEntryEntity, JournalLineEntity } from '../../../core/domain/entities/index.js'

export interface JournalRepository {
  findMany(tenantId: string, opts?: any): Promise<{ entries: JournalEntryEntity[]; total: number }>
  findFirst(where: any, include?: any): Promise<JournalEntryEntity | null>
  create(data: any, include?: any): Promise<JournalEntryEntity>
  update(id: string, data: any, include?: any): Promise<JournalEntryEntity>
  delete(id: string): Promise<JournalEntryEntity>
  count(where: any): Promise<number>
  findManyLines(where: any, opts?: any): Promise<JournalLineEntity[]>
  countLines(where: any): Promise<number>
}
