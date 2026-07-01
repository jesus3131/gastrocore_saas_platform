import type { DomainEvent } from '../../core/domain/events/domain-event.js'
import type { EventBus } from '../../core/ports/event-bus.js'
import { WebSocketGateway } from './websocket-gateway.js'
import { logger } from '../../config/logger.js'

export class EventBroadcaster {
  constructor(
    private readonly eventBus: EventBus,
    private readonly gateway: WebSocketGateway,
  ) {}

  start() {
    this.eventBus.subscribe('*', async (event: DomainEvent) => {
      const payload = (event as any).payload
      const tenantId = payload?.tenantId
      if (!tenantId) return

      try {
        this.gateway.broadcastToTenant(tenantId, event.eventName, {
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          occurredOn: event.occurredOn,
          payload,
        })
      } catch (err) {
        logger.error({ err, eventName: event.eventName }, 'Failed to broadcast event')
      }
    })
    logger.info('Event broadcaster subscribed to all events')
  }
}
