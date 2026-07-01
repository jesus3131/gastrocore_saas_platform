import type { DomainEvent } from '../../core/domain/events/domain-event.js'
import type { EventBus } from '../../core/ports/event-bus.js'
import { prisma } from '../../config/database/prisma.js'
import { logger } from '../../config/logger.js'

type EventHandler = (event: DomainEvent) => Promise<void>

export class OutboxEventBus implements EventBus {
  private handlers = new Map<string, EventHandler[]>()

  async publish(event: DomainEvent): Promise<void> {
    const payload = (event as any).payload || {}
    const tenantId = payload?.tenantId || null

    const handlers = this.getHandlers(event.eventName)
    let status = 'pending'
    let lastError: string | null = null

    if (handlers.length > 0) {
      try {
        await Promise.all(
          handlers.map(h => h(event).catch(err => { throw err }))
        )
        status = 'sent'
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        logger.error({ err, eventName: event.eventName }, 'Inline handler failed, will retry via outbox')
      }
    } else {
      status = 'sent'
    }

    await prisma.outboxMessage.create({
      data: {
        eventName: event.eventName,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        payload: payload as any,
        tenantId,
        status,
        lastError,
        processedAt: status === 'sent' ? new Date() : null,
      },
    })

    logger.debug({ eventName: event.eventName, aggregateId: event.aggregateId, status }, 'Event published')
  }

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) || []
    existing.push(handler)
    this.handlers.set(eventName, existing)
  }

  getHandlers(eventName: string): EventHandler[] {
    return this.handlers.get(eventName) || []
  }

  hasSubscribers(eventName: string): boolean {
    return this.handlers.has(eventName)
  }
}