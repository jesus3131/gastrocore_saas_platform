import type { PosOrder, MenuItem } from '../../../core/domain/entities/index.js'

export interface AnalyticsRepository {
  findOrders(tenantId: string, where?: any, options?: any): Promise<PosOrder[]>
  findMenuItems(tenantId: string, options?: any): Promise<MenuItem[]>
  findBranches(tenantId: string): Promise<any[]>
  aggregateOrder(tenantId: string, where: any, aggregate: any): Promise<any>
}
