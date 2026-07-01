import type { PosPayment } from '../../../core/domain/entities/index.js'

export interface PaymentRepository {
  create(data: {
    tenantId?: string
    orderId: string
    method: string
    amount: number
    reference?: string
    status?: string
    metadata?: any
  }): Promise<PosPayment>
  createMany(data: Array<{
    tenantId?: string
    orderId: string
    method: string
    amount: number
    reference?: string
    status?: string
    metadata?: any
  }>): Promise<PosPayment[]>
}
