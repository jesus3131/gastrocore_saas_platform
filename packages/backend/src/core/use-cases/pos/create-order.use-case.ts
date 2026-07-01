import { injectable, inject } from 'tsyringe'
import type { UnitOfWork } from '../../ports/unit-of-work.js'
import type { EventBus } from '../../ports/event-bus.js'
import type { OrderRepository, CreateOrderData } from '../../ports/repositories/order.repository.js'
import type { MenuRepository } from '../../ports/repositories/menu.repository.js'
import type { InventoryRepository } from '../../ports/repositories/inventory.repository.js'
import type { TableRepository } from '../../ports/repositories/table.repository.js'
import { OrderCreatedEvent } from '../../domain/events/order-events.js'
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
        await this.tableRepo.updateStatus(input.tableId, 'occupied')
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
    for (const item of items) {
      const recipe = await this.menuRepo.findRecipeByMenuItem(item.menuItemId)
      if (!recipe) continue

      for (const ingredient of recipe.ingredients) {
        const qtyToDeduct = ingredient.quantity * item.quantity

        await this.inventoryRepo.deductStock(ingredient.ingredientId, tenantId, qtyToDeduct)
        await this.inventoryRepo.createMovement(
          ingredient.ingredientId,
          'out',
          qtyToDeduct,
          `order-${item.menuItemId}`,
        )

        const updated = await this.inventoryRepo.findById(ingredient.ingredientId)
        if (updated && updated.currentStock <= updated.minimumStock) {
          logger.warn(
            { ingredient: updated.name, stock: updated.currentStock, unit: updated.unit },
            'Low stock alert',
          )
        }
      }
    }
  }
}
