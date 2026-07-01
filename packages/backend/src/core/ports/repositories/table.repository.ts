import type { PosTable, Branch } from '../../../core/domain/entities/index.js'

export interface TableRepository {
  updateStatus(id: string, status: string): Promise<PosTable>
  findById(id: string): Promise<PosTable | null>
  findAllWithBranches(tenantId: string): Promise<Branch[]>
}
