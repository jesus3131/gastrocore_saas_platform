export interface AnalyticsRepository {
  findOrders(tenantId: string, where?: any): Promise<any[]>
  findMenuItems(tenantId: string): Promise<any[]>
  findBranches(tenantId: string): Promise<any[]>
  aggregateOrder(tenantId: string, where: any, aggregate: any): Promise<any>
}
