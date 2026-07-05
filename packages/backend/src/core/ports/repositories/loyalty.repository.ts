import type { LoyaltyProgram, LoyaltyRedemption } from '../../../core/domain/entities/index.js'

export interface LoyaltyRepository {
  findProgram(tenantId: string): Promise<LoyaltyProgram | null>
  createProgram(data: any): Promise<LoyaltyProgram>
  createRedemption(data: any): Promise<LoyaltyRedemption>
  findRedemptions(customerId: string): Promise<LoyaltyRedemption[]>
  findRedemptionsByTenant(tenantId: string): Promise<LoyaltyRedemption[]>
}
