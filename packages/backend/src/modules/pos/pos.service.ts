import { injectable, inject } from 'tsyringe'
import type { OrderStatus, PaymentMethod } from '@prisma/client'
import type { OrderRepository } from '../../core/ports/repositories/order.repository.js'
import type { MenuRepository } from '../../core/ports/repositories/menu.repository.js'
import type { TableRepository } from '../../core/ports/repositories/table.repository.js'
import type { PaymentRepository } from '../../core/ports/repositories/payment.repository.js'
import { AppError } from '../../common/filters/error-handler.js'
import type { CreateOrderInput } from '../../core/use-cases/pos/create-order.use-case.js'
import { CreateOrderUseCase } from '../../core/use-cases/pos/create-order.use-case.js'

@injectable()
export class PosService {
  constructor(
    @inject(CreateOrderUseCase) private readonly createOrderUseCase: CreateOrderUseCase,
    @inject('OrderRepository') private readonly orderRepo: OrderRepository,
    @inject('MenuRepository') private readonly menuRepo: MenuRepository,
    @inject('TableRepository') private readonly tableRepo: TableRepository,
    @inject('PaymentRepository') private readonly paymentRepo: PaymentRepository,
  ) {}

  async getMenu(tenantId: string) {
    return this.menuRepo.getMenu(tenantId)
  }

  async getMenuItems(tenantId: string, categoryId: string) {
    return this.menuRepo.getMenuItems(tenantId, categoryId)
  }

  async getTables(tenantId: string) {
    const branches = await this.tableRepo.findAllWithBranches(tenantId)

    const tableIds = branches.flatMap((b: any) => (b.areas ?? []).flatMap((a: any) => (a.tables ?? []).map((t: any) => t.id)))

    const activeOrders = tableIds.length > 0 ? await this.orderRepo.findActiveByTables(tableIds) : []

    const orderMap = new Map(activeOrders.map((o: any) => [o.tableId, { id: o.id, total: o.total, status: o.status }]))

    for (const branch of branches) {
      for (const area of branch.areas ?? []) {
        for (const table of area.tables ?? []) {
          ;(table as any).activeOrder = orderMap.get(table.id) || null
        }
      }
    }

    return branches
  }

  async updateTableStatus(tenantId: string, id: string, status: string) {
    const table = await this.tableRepo.findById(id)
    if (!table) throw new AppError(404, 'TABLE_NOT_FOUND', 'Table not found')

    const branch = await this.tableRepo.findBranchByTable(id)
    if (!branch || branch.tenantId !== tenantId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this table')
    }

    return this.tableRepo.updateStatus(id, status)
  }

  async getOrders(tenantId: string, query?: { status?: string; limit?: number; offset?: number }) {
    return this.orderRepo.findMany(tenantId, query)
  }

  async createOrder(tenantId: string, data: any, userId: string) {
    const input: CreateOrderInput = {
      tenantId,
      branchId: data.branchId,
      tableId: data.tableId,
      userId,
      customerId: data.customerId,
      type: data.type || 'dine_in',
      subtotal: data.subtotal,
      tax: data.tax || 0,
      discount: data.discount || 0,
      total: data.total,
      notes: data.notes,
      items: data.items,
    }
    return this.createOrderUseCase.execute(input)
  }

  async getOrder(tenantId: string, id: string) {
    const order = await this.orderRepo.findById(tenantId, id)
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')
    return order
  }

  async updateOrderStatus(tenantId: string, id: string, status: OrderStatus) {
    const order = await this.orderRepo.findById(tenantId, id)
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')
    return this.orderRepo.updateStatus(id, status)
  }

  async processPayment(tenantId: string, data: { orderId: string; method: PaymentMethod; amount: number; reference?: string }) {
    const order = await this.orderRepo.findById(tenantId, data.orderId)
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')

    const payment = await this.paymentRepo.create({
      tenantId,
      orderId: data.orderId,
      method: data.method,
      amount: data.amount,
      reference: data.reference,
      status: 'completed',
    })

    await this.orderRepo.updatePaymentMethod(data.orderId, data.method)
    await this.orderRepo.updateStatus(data.orderId, 'paid')

    if (order.tableId) {
      await this.tableRepo.updateStatus(order.tableId, 'available')
    }

    return payment
  }

  async splitBill(tenantId: string, data: { orderId: string; splits: { items: string[]; amount: number }[] }) {
    const order = await this.orderRepo.findById(tenantId, data.orderId)
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')

    return this.paymentRepo.createMany(
      data.splits.map((split) => ({
        tenantId,
        orderId: data.orderId,
        method: 'cash',
        amount: split.amount,
        status: 'completed',
        metadata: { splitItems: split.items },
      }))
    )
  }
}
