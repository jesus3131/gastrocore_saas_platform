import type { SubscriptionEntity, SubscriptionInvoiceEntity } from '../../../core/domain/entities/index.js'

export interface SubscriptionRepository {
  findFirst(where: any, include?: any): Promise<SubscriptionEntity | null>
  create(data: any): Promise<SubscriptionEntity>
  createInvoice(data: any): Promise<SubscriptionInvoiceEntity>
  findInvoices(tenantId: string, opts?: any): Promise<SubscriptionInvoiceEntity[]>
}
