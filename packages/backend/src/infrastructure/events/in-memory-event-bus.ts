import type { DomainEvent } from '../../core/domain/events/domain-event.js'
import type { EventBus } from '../../core/ports/event-bus.js'
import { logger } from '../../config/logger.js'

type EventHandler = (event: DomainEvent) => Promise<void>

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, EventHandler[]>()

  async publish(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventName) || []
    logger.debug({ eventName: event.eventName, aggregateId: event.aggregateId, handlerCount: eventHandlers.length }, 'Publishing event')

    await Promise.all(
      eventHandlers.map((handler) =>
        handler(event).catch((err) => {
          logger.error({ err, eventName: event.eventName }, 'Event handler failed')
        })
      )
    )
  }

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) || []
    existing.push(handler)
    this.handlers.set(eventName, existing)
  }
}
