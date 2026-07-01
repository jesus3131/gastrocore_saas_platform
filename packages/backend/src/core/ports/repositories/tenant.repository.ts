export interface TenantRepository {
  findById(id: string): Promise<any>
  update(id: string, data: any): Promise<any>
  getFeatureFlags(tenantId: string): Promise<any[]>
  upsertFeatureFlag(tenantId: string, feature: string, enabled: boolean): Promise<void>
  findUsersByTenant(tenantId: string, opts?: { role?: string; isActive?: boolean }): Promise<any[]>
}
