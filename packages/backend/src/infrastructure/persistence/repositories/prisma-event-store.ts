import { prisma } from '../../../config/database/prisma.js'
import type { DomainEvent } from '../../../core/domain/events/domain-event.js'
import type { EventStore, StoredEvent } from '../../../core/ports/event-store.js'

export class PrismaEventStore implements EventStore {
  async save(event: DomainEvent, aggregateType?: string): Promise<void> {
    await prisma.event.create({
      data: {
        eventName: event.eventName,
        aggregateId: event.aggregateId,
        aggregateType: aggregateType || event.aggregateType,
        payload: JSON.parse(JSON.stringify(event)),
        occurredOn: event.occurredOn,
      },
    })
  }

  async findByAggregate(aggregateId: string, aggregateType: string): Promise<StoredEvent[]> {
    const events = await prisma.event.findMany({
      where: { aggregateId, aggregateType },
      orderBy: { occurredOn: 'asc' },
    })
    return events.map((e) => ({
      id: e.id,
      tenantId: e.tenantId,
      eventName: e.eventName,
      aggregateId: e.aggregateId,
      aggregateType: e.aggregateType,
      payload: e.payload as any,
      occurredOn: e.occurredOn,
    }))
  }

  async findByTenant(tenantId: string, limit = 50): Promise<StoredEvent[]> {
    const events = await prisma.event.findMany({
      where: { tenantId },
      orderBy: { occurredOn: 'desc' },
      take: limit,
    })
    return events.map((e) => ({
      id: e.id,
      tenantId: e.tenantId,
      eventName: e.eventName,
      aggregateId: e.aggregateId,
      aggregateType: e.aggregateType,
      payload: e.payload as any,
      occurredOn: e.occurredOn,
    }))
  }
}
