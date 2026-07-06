import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { injectable, inject } from 'tsyringe'
import type { UserRepository } from '../../core/ports/repositories/user.repository.js'
import type { EmployeeRepository } from '../../core/ports/repositories/employee.repository.js'
import type { OrderRepository } from '../../core/ports/repositories/order.repository.js'
import type { MenuRepository } from '../../core/ports/repositories/menu.repository.js'
import type { TableRepository } from '../../core/ports/repositories/table.repository.js'
import type { PaymentRepository } from '../../core/ports/repositories/payment.repository.js'
import type { TenantRepository } from '../../core/ports/repositories/tenant.repository.js'
import type { EventBus } from '../../core/ports/event-bus.js'
import type { CreateOrderInput } from '../../core/use-cases/pos/create-order.use-case.js'
import { CreateOrderUseCase } from '../../core/use-cases/pos/create-order.use-case.js'
import { TableStatusChangedEvent } from '../../core/domain/events/order-events.js'
import { AppError } from '../../common/filters/error-handler.js'
import { env } from '../../config/env.js'

@injectable()
export class WaiterService {
  constructor(
    @inject(CreateOrderUseCase) private readonly createOrderUseCase: CreateOrderUseCase,
    @inject('UserRepository') private readonly userRepo: UserRepository,
    @inject('EmployeeRepository') private readonly employeeRepo: EmployeeRepository,
    @inject('OrderRepository') private readonly orderRepo: OrderRepository,
    @inject('MenuRepository') private readonly menuRepo: MenuRepository,
    @inject('TableRepository') private readonly tableRepo: TableRepository,
    @inject('PaymentRepository') private readonly paymentRepo: PaymentRepository,
    @inject('TenantRepository') private readonly tenantRepo: TenantRepository,
    @inject('EventBus') private readonly eventBus: EventBus,
  ) {}

  async login(email: string, password: string, tenantId?: string) {
    const user = await this.userRepo.findByEmail(email, tenantId)
    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    }
    if (!user.tenantId) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Use super admin login endpoint')
    }
    if (user.tenantRole !== 'waiter') {
      throw new AppError(403, 'FORBIDDEN', 'Access restricted to waiters only')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    }

    let branchId: string | undefined
    if (user.employeeId) {
      const employee = await this.employeeRepo.findById(user.tenantId, user.employeeId)
      if (employee) {
        branchId = employee.branchId || undefined
      }
    }

    const token = jwt.sign(
      {
        sub: user.id,
        tenantId: user.tenantId,
        branchId,
        globalRole: user.globalRole,
        tenantRole: 'waiter',
        email: user.email,
        authMethod: 'password',
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRATION } as jwt.SignOptions,
    )

    const { passwordHash, refreshToken, ...safeUser } = user
    return {
      user: { ...safeUser, branchId },
      token,
    }
  }

  async loginWithPin(pin: string, tenantSlug: string) {
    const tenant = await this.tenantRepo.findBySlug(tenantSlug, { id: true, name: true })
    if (!tenant) {
      throw new AppError(404, 'TENANT_NOT_FOUND', 'Restaurant not found')
    }
    const employee = await this.employeeRepo.findByPin(tenant.id, pin, 'waiter')
    if (!employee) {
      throw new AppError(401, 'INVALID_PIN', 'Invalid PIN')
    }
    const user = await this.userRepo.findFirst({ where: { tenantId: tenant.id, employeeId: employee.id } })
    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_PIN', 'User account is inactive')
    }

    const token = jwt.sign(
      {
        sub: user.id,
        tenantId: tenant.id,
        branchId: employee.branchId,
        globalRole: user.globalRole,
        tenantRole: 'waiter',
        email: user.email,
        authMethod: 'pin',
        employeeId: employee.id,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRATION } as jwt.SignOptions,
    )

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId: tenant.id,
        branchId: employee.branchId,
        employeeId: employee.id,
        tenantRole: 'waiter',
      },
      token,
    }
  }

  async listTenants() {
    return this.tenantRepo.findManyTenants({
      select: { id: true, name: true, slug: true },
      where: { subscriptionStatus: { not: 'canceled' } },
    })
  }

  async getMenu(tenantId: string) {
    const menu = await this.menuRepo.getMenu(tenantId)
    return menu.map((cat: any) => ({
      ...cat,
      menuItems: cat.menuItems?.map((item: any) => ({
        ...item,
        price: Number(item.price),
        cost: item.cost != null ? Number(item.cost) : undefined,
      })),
    }))
  }

  async getTables(tenantId: string, branchId?: string) {
    const branches = await this.tableRepo.findAllWithBranches(tenantId)
    const filtered = branchId ? branches.filter((b: any) => b.id === branchId) : branches
    const tableIds = filtered.flatMap((b: any) => (b.areas ?? []).flatMap((a: any) => (a.tables ?? []).map((t: any) => t.id)))
    const activeOrders = tableIds.length > 0 ? await this.orderRepo.findActiveByTables(tableIds) : []
    const orderMap = new Map(activeOrders.map((o: any) => [o.tableId, { id: o.id, total: o.total, status: o.status }]))
    for (const branch of filtered) {
      for (const area of branch.areas ?? []) {
        for (const table of area.tables ?? []) {
          ;(table as any).activeOrder = orderMap.get(table.id) || null
        }
      }
    }
    return filtered
  }

  async openTable(tenantId: string, tableId: string, userId: string) {
    const table = await this.tableRepo.findById(tenantId, tableId)
    if (!table) throw new AppError(404, 'TABLE_NOT_FOUND', 'Mesa no encontrada')
    if (table.status !== 'available') throw new AppError(409, 'TABLE_NOT_AVAILABLE', 'La mesa no está disponible')

    const user = await this.userRepo.findById(userId)
    const waiterName = user?.name || 'Mesero'

    const previousStatus = table.status
    await this.tableRepo.updateStatus(tenantId, tableId, 'taking_order')
    await this.tableRepo.assignWaiter(tenantId, tableId, userId, waiterName)

    const event = new TableStatusChangedEvent(tableId, {
      tenantId,
      tableId,
      tableLabel: table.label,
      status: 'taking_order',
      previousStatus,
      waiterId: userId,
      waiterName,
    })
    await this.eventBus.publish(event)

    return { id: tableId, label: table.label, status: 'taking_order', waiterId: userId, waiterName }
  }

  async createOrder(tenantId: string, data: any, userId: string) {
    const input: CreateOrderInput = {
      tenantId,
      branchId: data.branchId,
      tableId: data.tableId,
      userId,
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

  async requestBill(tenantId: string, tableId: string) {
    const table = await this.tableRepo.findById(tenantId, tableId)
    if (!table) throw new AppError(404, 'TABLE_NOT_FOUND', 'Table not found')
    const active = await this.orderRepo.findActiveByTable(tenantId, tableId)
    if (!active) throw new AppError(404, 'NO_ACTIVE_ORDER', 'No active order for this table')
    const previousStatus = table.status
    await this.tableRepo.updateStatus(tenantId, tableId, 'bill_requested')

    const event = new TableStatusChangedEvent(tableId, {
      tenantId,
      tableId,
      tableLabel: table.label,
      status: 'bill_requested',
      previousStatus,
    })
    await this.eventBus.publish(event)

    return active
  }

  async processPayment(tenantId: string, tableId: string, data: { method: string; tip: number; paidAmount: number }) {
    const table = await this.tableRepo.findById(tenantId, tableId)
    if (!table) throw new AppError(404, 'TABLE_NOT_FOUND', 'Table not found')
    const active = await this.orderRepo.findActiveByTable(tenantId, tableId)
    if (!active) throw new AppError(404, 'NO_ACTIVE_ORDER', 'No active order for this table')
    const order = await this.orderRepo.findById(tenantId, active.id)
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')

    const payment = await this.paymentRepo.create({
      tenantId,
      orderId: order.id,
      method: data.method,
      amount: data.paidAmount,
      status: 'completed',
      metadata: { tip: data.tip },
    })

    await this.orderRepo.updatePaymentMethod(order.id, data.method)
    await this.orderRepo.updateStatus(order.id, 'paid')
    await this.tableRepo.updateStatus(tenantId, tableId, 'available')
    await this.tableRepo.clearWaiter(tenantId, tableId)

    const event = new TableStatusChangedEvent(tableId, {
      tenantId,
      tableId,
      tableLabel: table.label,
      status: 'available',
      previousStatus: 'occupied',
    })
    await this.eventBus.publish(event)

    return {
      payment,
      table: table.label,
      total: order.total,
      tip: data.tip,
      paid: data.paidAmount,
    }
  }
}
