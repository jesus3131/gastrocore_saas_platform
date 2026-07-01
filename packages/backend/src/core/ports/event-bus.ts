import type { DomainEvent } from '../domain/events/domain-event.js'

export interface EventBus {
  publish(event: DomainEvent): Promise<void>
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void
}
