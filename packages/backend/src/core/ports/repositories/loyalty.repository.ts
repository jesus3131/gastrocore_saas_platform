export interface LoyaltyRepository {
  findProgram(tenantId: string): Promise<any>
  createProgram(data: any): Promise<any>
  createRedemption(data: any): Promise<any>
  findRedemptions(customerId: string): Promise<any[]>
}
