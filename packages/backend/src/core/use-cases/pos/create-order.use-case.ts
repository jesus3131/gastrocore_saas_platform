import { injectable, inject } from 'tsyringe'
import type { UnitOfWork } from '../../ports/unit-of-work.js'
import type { EventBus } from '../../ports/event-bus.js'
import type { OrderRepository, CreateOrderData } from '../../ports/repositories/order.repository.js'
import type { MenuRepository } from '../../ports/repositories/menu.repository.js'
import type { InventoryRepository } from '../../ports/repositories/inventory.repository.js'
import type { TableRepository } from '../../ports/repositories/table.repository.js'
import { OrderCreatedEvent, TableStatusChangedEvent } from '../../domain/events/order-events.js'
import { logger } from '../../../config/logger.js'
import { TenantId } from '../../domain/value-objects/tenant-id.js'
import { Money } from '../../domain/value-objects/money.js'

export interface CreateOrderInput {
  tenantId: string
  branchId?: string
  tableId?: string
  customerId?: string
  userId: string
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

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject('UnitOfWork') private readonly uow: UnitOfWork,
    @inject('EventBus') private readonly eventBus: EventBus,
    @inject('OrderRepository') private readonly orderRepo: OrderRepository,
    @inject('MenuRepository') private readonly menuRepo: MenuRepository,
    @inject('InventoryRepository') private readonly inventoryRepo: InventoryRepository,
    @inject('TableRepository') private readonly tableRepo: TableRepository,
  ) {}

  async execute(input: CreateOrderInput) {
    TenantId.fromString(input.tenantId)
    Money.fromNumber(input.total)

    return this.uow.execute(async () => {
      const orderData: CreateOrderData = {
        tenantId: input.tenantId,
        branchId: input.branchId,
        tableId: input.tableId,
        userId: input.userId,
        customerId: input.customerId,
        type: input.type || 'dine_in',
        subtotal: input.subtotal,
        tax: input.tax || 0,
        discount: input.discount || 0,
        total: input.total,
        notes: input.notes,
        items: input.items,
      }

      const order = await this.orderRepo.create(orderData)

      if (input.tableId) {
        const table = await this.tableRepo.findById(input.tenantId, input.tableId)
        const previousStatus = table?.status || 'available'
        await this.tableRepo.updateStatus(input.tenantId, input.tableId, 'occupied')

        const tableEvent = new TableStatusChangedEvent(input.tableId, {
          tenantId: input.tenantId,
          tableId: input.tableId,
          tableLabel: table?.label || '',
          status: 'occupied',
          previousStatus,
        })
        await this.eventBus.publish(tableEvent)
      }

      await this.deductInventory(input.tenantId, input.items)

      const event = new OrderCreatedEvent(order.id, {
        orderId: order.id,
        tenantId: input.tenantId,
        tableId: input.tableId || null,
        total: Number(order.total),
        itemCount: input.items.length,
        createdAt: order.createdAt,
      })
      await this.eventBus.publish(event)

      return order
    })
  }

  private async deductInventory(tenantId: string, items: CreateOrderInput['items']) {
    const accum = new Map<string, { ingredientId: string; qty: number; itemName: string }>()

    for (const item of items) {
      const recipe = await this.menuRepo.findRecipeByMenuItem(item.menuItemId)
      if (!recipe) continue

      for (const ingredient of recipe.ingredients) {
        const qtyToDeduct = ingredient.quantity * item.quantity
        const existing = accum.get(ingredient.ingredientId)
        if (existing) {
          existing.qty += qtyToDeduct
        } else {
          accum.set(ingredient.ingredientId, {
            ingredientId: ingredient.ingredientId,
            qty: qtyToDeduct,
            itemName: item.name,
          })
        }
      }
    }

    for (const entry of accum.values()) {
      await this.inventoryRepo.deductStock(entry.ingredientId, tenantId, entry.qty)
      await this.inventoryRepo.createMovement(
        entry.ingredientId,
        tenantId,
        'out',
        entry.qty,
        `order-${entry.itemName}`,
      )

      const updated = await this.inventoryRepo.findById(entry.ingredientId)
      if (updated && updated.currentStock <= updated.minimumStock) {
        logger.warn(
          { ingredient: updated.name, stock: updated.currentStock, unit: updated.unit },
          'Low stock alert',
        )
      }
    }
  }
}
