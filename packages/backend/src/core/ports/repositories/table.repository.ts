import type { PosTable, Branch } from '../../../core/domain/entities/index.js'

export interface TableRepository {
  updateStatus(tenantId: string, id: string, status: string): Promise<PosTable>
  findById(tenantId: string, id: string): Promise<PosTable | null>
  findBranchByTable(tableId: string): Promise<Branch | null>
  findAllWithBranches(tenantId: string): Promise<Branch[]>
  assignWaiter(tenantId: string, id: string, waiterId: string, waiterName: string): Promise<PosTable>
  clearWaiter(tenantId: string, id: string): Promise<PosTable>
}
