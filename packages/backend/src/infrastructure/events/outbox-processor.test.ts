import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OutboxEventBus } from './outbox-event-bus.js'
import { OutboxProcessor } from './outbox-processor.js'

vi.mock('../../config/database/prisma.js', () => ({
  prisma: {
    outboxMessage: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
      fields: { maxRetries: 3 },
    },
  },
}))

vi.mock('../../config/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const mockMessage: any = {
  id: 'msg-1',
  eventName: 'test.event',
  aggregateId: 'agg-1',
  aggregateType: 'test',
  payload: { tenantId: 't-1' },
  tenantId: 't-1',
  retryCount: 0,
  maxRetries: 3,
}

describe('OutboxProcessor', () => {
  let bus: OutboxEventBus
  let processor: OutboxProcessor

  beforeEach(() => {
    vi.clearAllMocks()
    bus = new OutboxEventBus()
    processor = new OutboxProcessor(bus)
  })

  afterEach(() => {
    processor.stop()
  })

  it('processes pending messages successfully', async () => {
    const handler = vi.fn().mockResolvedValue(undefined)
    bus.subscribe('test.event', handler)
    const { prisma } = await import('../../config/database/prisma.js')

    vi.mocked(prisma.outboxMessage.findMany).mockResolvedValue([mockMessage] as any)
    vi.mocked(prisma.outboxMessage.update).mockResolvedValue(mockMessage as any)

    await processor.processBatch()

    expect(prisma.outboxMessage.findMany).toHaveBeenCalled()
    expect(prisma.outboxMessage.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['msg-1'] }, status: 'pending' },
      data: { status: 'processing' },
    })
    expect(handler).toHaveBeenCalledOnce()
    expect(prisma.outboxMessage.update).toHaveBeenCalledWith({
      where: { id: 'msg-1' },
      data: expect.objectContaining({ status: 'sent', processedAt: expect.any(Date) }),
    })
  })

  it('marks as sent when no handlers registered', async () => {
    const { prisma } = await import('../../config/database/prisma.js')
    vi.mocked(prisma.outboxMessage.findMany).mockResolvedValue([mockMessage] as any)
    vi.mocked(prisma.outboxMessage.update).mockResolvedValue(mockMessage as any)

    await processor.processBatch()

    expect(prisma.outboxMessage.update).toHaveBeenCalledWith({
      where: { id: 'msg-1' },
      data: expect.objectContaining({ status: 'sent', processedAt: expect.any(Date) }),
    })
  })

  it('retries on handler failure and updates retryCount', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('handler error'))
    bus.subscribe('test.event', handler)
    const { prisma } = await import('../../config/database/prisma.js')

    vi.mocked(prisma.outboxMessage.findMany).mockResolvedValue([mockMessage] as any)
    vi.mocked(prisma.outboxMessage.update).mockResolvedValue(mockMessage as any)

    await processor.processBatch()

    expect(prisma.outboxMessage.update).toHaveBeenCalledWith({
      where: { id: 'msg-1' },
      data: expect.objectContaining({
        status: 'pending',
        retryCount: 1,
        lastError: 'handler error',
        scheduledAt: expect.any(Date),
      }),
    })
  })

  it('moves to dead letter after max retries', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('handler error'))
    bus.subscribe('test.event', handler)
    const { prisma } = await import('../../config/database/prisma.js')

    const deadMessage: any = { ...mockMessage, retryCount: 2, maxRetries: 3 }
    vi.mocked(prisma.outboxMessage.findMany).mockResolvedValue([deadMessage] as any)
    vi.mocked(prisma.outboxMessage.update).mockResolvedValue(deadMessage as any)

    await processor.processBatch()

    expect(prisma.outboxMessage.update).toHaveBeenCalledWith({
      where: { id: 'msg-1' },
      data: expect.objectContaining({
        status: 'failed',
        retryCount: 3,
      }),
    })
  })

  it('skips batch when no pending messages', async () => {
    const { prisma } = await import('../../config/database/prisma.js')
    vi.mocked(prisma.outboxMessage.findMany).mockResolvedValue([] as any)

    await processor.processBatch()

    expect(prisma.outboxMessage.updateMany).not.toHaveBeenCalled()
    expect(prisma.outboxMessage.update).not.toHaveBeenCalled()
  })

  it('start and stop manage the polling interval', async () => {
    vi.useFakeTimers()
    const { prisma } = await import('../../config/database/prisma.js')
    vi.mocked(prisma.outboxMessage.findMany).mockResolvedValue([] as any)

    processor.start()
    expect(vi.getTimerCount()).toBe(1)

    processor.stop()
    expect(vi.getTimerCount()).toBe(0)

    vi.useRealTimers()
  })

  it('handles batch processing error gracefully', async () => {
    const { prisma } = await import('../../config/database/prisma.js')
    vi.mocked(prisma.outboxMessage.findMany).mockRejectedValue(new Error('db error'))

    await expect(processor.processBatch()).resolves.not.toThrow()
  })

  it('computes exponential backoff', () => {
    expect((processor as any).backoff(1)).toBe(1000)
    expect((processor as any).backoff(2)).toBe(2000)
    expect((processor as any).backoff(3)).toBe(4000)
    expect((processor as any).backoff(4)).toBe(8000)
    expect((processor as any).backoff(6)).toBe(30000)
  })
})
