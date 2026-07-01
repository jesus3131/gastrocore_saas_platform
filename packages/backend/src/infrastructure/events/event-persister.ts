import type { DomainEvent } from '../../core/domain/events/domain-event.js'
import type { EventStore } from '../../core/ports/event-store.js'
import type { EventBus } from '../../core/ports/event-bus.js'
import { logger } from '../../config/logger.js'

export class EventPersister {
  constructor(
    private readonly eventStore: EventStore,
    private readonly eventBus: EventBus,
  ) {}

  start() {
    this.eventBus.subscribe('*', async (event: DomainEvent) => {
      try {
        await this.eventStore.save(event, event.aggregateType)
      } catch (err) {
        logger.error({ err, eventName: event.eventName }, 'Failed to persist event')
      }
    })
    logger.info('Event persister subscribed to all events')
  }
}
