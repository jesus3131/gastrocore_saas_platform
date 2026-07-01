import type { IntegrationEntity } from '../../../core/domain/entities/index.js'

export interface IntegrationRepository {
  findMany(tenantId: string, type?: string): Promise<IntegrationEntity[]>
  findFirst(where: any): Promise<IntegrationEntity | null>
  findUnique(where: any): Promise<IntegrationEntity | null>
  create(data: any): Promise<IntegrationEntity>
  update(id: string, data: any): Promise<IntegrationEntity>
  delete(id: string): Promise<IntegrationEntity>
}
