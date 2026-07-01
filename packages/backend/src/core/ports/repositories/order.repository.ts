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

export interface OrderRepository {
  create(data: CreateOrderData): Promise<any>
  findById(tenantId: string, id: string): Promise<any>
  findActiveByTable(tenantId: string, tableId: string): Promise<any>
  updateStatus(id: string, status: string): Promise<any>
}
