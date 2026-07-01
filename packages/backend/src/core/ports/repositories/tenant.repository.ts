import type { Tenant, TenantFeatureFlagEntity, Branch, AuthUser, PaginationOpts } from '../../../core/domain/entities/index.js'

export interface TenantRepository {
  findById(id: string, select?: any): Promise<Tenant | null>
  update(id: string, data: any): Promise<Tenant>
  create(data: any): Promise<Tenant>
  getFeatureFlags(tenantId: string, opts?: { enabled?: boolean }): Promise<TenantFeatureFlagEntity[]>
  upsertFeatureFlag(tenantId: string, feature: string, enabled: boolean): Promise<void>
  findUsersByTenant(tenantId: string, opts?: { role?: string; isActive?: boolean }): Promise<AuthUser[]>

  findManyTenants(options?: any): Promise<Tenant[]>
  createBranch(data: any): Promise<Branch>
  createServiceArea(data: any): Promise<any>
  createTable(data: any): Promise<any>
  deleteFeatureFlags(where: any): Promise<void>
  findManyAdmins(tenantId: string): Promise<AuthUser[]>
  updateAdminPassword(userId: string, passwordHash: string): Promise<void>
}
