import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OutboxEventBus } from './outbox-event-bus.js'

vi.mock('../../config/database/prisma.js', () => ({
  prisma: {
    outboxMessage: {
      create: vi.fn().mockResolvedValue({ id: 'msg-1' }),
    },
  },
}))

vi.mock('../../config/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

function makeEvent(overrides = {}) {
  return {
    eventName: 'test.event',
    aggregateId: 'agg-1',
    aggregateType: 'test',
    occurredOn: new Date(),
    payload: { tenantId: 'tenant-1', value: 42 },
    ...overrides,
  }
}

describe('OutboxEventBus', () => {
  let bus: OutboxEventBus

  beforeEach(() => {
    bus = new OutboxEventBus()
    vi.clearAllMocks()
  })

  it('publishes event without handlers and marks as sent', async () => {
    const event = makeEvent()
    const { prisma } = await import('../../config/database/prisma.js')

    await bus.publish(event)

    expect(prisma.outboxMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventName: 'test.event',
        aggregateId: 'agg-1',
        status: 'sent',
        processedAt: expect.any(Date),
      }),
    })
  })

  it('runs inline handlers and marks as sent on success', async () => {
    const handler = vi.fn().mockResolvedValue(undefined)
    bus.subscribe('test.event', handler)
    const { prisma } = await import('../../config/database/prisma.js')

    await bus.publish(makeEvent())

    expect(handler).toHaveBeenCalledOnce()
    expect(prisma.outboxMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'sent' }),
    })
  })

  it('marks as pending when inline handler fails', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('handler error'))
    bus.subscribe('test.event', handler)
    const { prisma } = await import('../../config/database/prisma.js')

    await bus.publish(makeEvent())

    expect(handler).toHaveBeenCalledOnce()
    expect(prisma.outboxMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'pending',
        lastError: 'handler error',
      }),
    })
  })

  it('subscribe registers handler for event name', () => {
    const handler = vi.fn()
    bus.subscribe('test.event', handler)

    expect(bus.hasSubscribers('test.event')).toBe(true)
    expect(bus.getHandlers('test.event')).toHaveLength(1)
    expect(bus.getHandlers('test.event')[0]).toBe(handler)
  })

  it('handles event with null tenantId in payload', async () => {
    const event = makeEvent({ payload: {} })
    const { prisma } = await import('../../config/database/prisma.js')

    await bus.publish(event)

    expect(prisma.outboxMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: null }),
    })
  })
})
