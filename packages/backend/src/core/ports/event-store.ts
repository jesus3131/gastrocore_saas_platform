import type { DomainEvent } from '../domain/events/domain-event.js'

export interface StoredEvent {
  id: string
  tenantId: string | null
  eventName: string
  aggregateId: string
  aggregateType: string
  payload: Record<string, unknown>
  occurredOn: Date
}

export interface EventStore {
  save(event: DomainEvent, aggregateType: string): Promise<void>
  findByAggregate(aggregateId: string, aggregateType: string): Promise<StoredEvent[]>
  findByTenant(tenantId: string, limit?: number): Promise<StoredEvent[]>
}
