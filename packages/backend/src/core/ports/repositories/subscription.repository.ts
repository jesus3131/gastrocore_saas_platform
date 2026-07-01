export interface SubscriptionRepository {
  findFirst(where: any): Promise<any>
  create(data: any): Promise<any>
  createInvoice(data: any): Promise<any>
  findInvoices(tenantId: string, opts?: any): Promise<any[]>
}
