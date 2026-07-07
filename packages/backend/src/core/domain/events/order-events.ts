import type { DomainEvent } from './domain-event.js'

export interface OrderCreatedPayload {
  orderId: string
  tenantId: string
  tableId: string | null
  total: number
  itemCount: number
  createdAt: Date
}

export class OrderCreatedEvent implements DomainEvent {
  readonly eventName = 'order.created'
  readonly aggregateType = 'Order'
  readonly occurredOn = new Date()

  constructor(
    readonly aggregateId: string,
    public readonly payload: OrderCreatedPayload,
  ) {}
}

export interface TableStatusChangedPayload {
  tenantId: string
  tableId: string
  tableLabel: string
  status: string
  previousStatus: string
  waiterId?: string | null
  waiterName?: string | null
}

export class TableStatusChangedEvent implements DomainEvent {
  readonly eventName = 'table.status_changed'
  readonly aggregateType = 'Table'
  readonly occurredOn = new Date()

  constructor(
    readonly aggregateId: string,
    public readonly payload: TableStatusChangedPayload,
  ) {}
}
