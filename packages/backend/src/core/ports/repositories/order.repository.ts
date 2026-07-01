export interface CreateOrderData {
  tenantId: string
  branchId?: string
  tableId?: string
  userId: string
  customerId?: string
  type: string
  subtotal: number
  tax: number
  discount: number
  total: number
  notes?: string
  items: Array<{
    menuItemId: string
    name: string
    quantity: number
    unitPrice: number
    notes?: string
    modifiers?: Array<{
      groupId: string
      optionId: string
      name: string
      price: number
    }>
  }>
}

import type { PosOrder, PaginationOpts } from '../../../core/domain/entities/index.js'

export interface OrderRepository {
  create(data: CreateOrderData): Promise<PosOrder>
  findById(tenantId: string, id: string): Promise<PosOrder | null>
  findActiveByTable(tenantId: string, tableId: string): Promise<{ id: string; total: number; status: string } | null>
  findMany(tenantId: string, query?: { status?: string } & PaginationOpts): Promise<PosOrder[]>
  findActiveByTables(tableIds: string[]): Promise<{ tableId: string; id: string; total: number; status: string }[]>
  updateStatus(id: string, status: string): Promise<PosOrder>
  updatePaymentMethod(id: string, method: string): Promise<PosOrder>
}
