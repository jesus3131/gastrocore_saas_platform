import type { AuthUser } from '../../../core/domain/entities/index.js'

export interface UserRepository {
  findByEmail(email: string, tenantId?: string): Promise<AuthUser | null>
  findById(id: string, select?: any): Promise<AuthUser | null>
  create(data: any): Promise<AuthUser>
  update(id: string, data: any, select?: any): Promise<AuthUser>
  findFirst(where: any): Promise<AuthUser | null>
}
