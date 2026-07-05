import type { OutboxEventBus } from './outbox-event-bus.js'
import type { DomainEvent } from '../../core/domain/events/domain-event.js'
import { prisma } from '../../config/database/prisma.js'
import { logger } from '../../config/logger.js'

const POLL_INTERVAL_MS = 5_000
const BATCH_SIZE = 50

export class OutboxProcessor {
  private running = false
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(private readonly eventBus: OutboxEventBus) {}

  start(): void {
    if (this.running) return
    this.running = true
    this.timer = setInterval(() => this.processBatch(), POLL_INTERVAL_MS)
    logger.info('OutboxProcessor started')
  }

  stop(): void {
    this.running = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    logger.info('OutboxProcessor stopped')
  }

  async processBatch(): Promise<void> {
    try {
      const messages = await prisma.outboxMessage.findMany({
        where: {
          status: 'pending',
          scheduledAt: { lte: new Date() },
          retryCount: { lt: prisma.outboxMessage.fields.maxRetries },
        },
        orderBy: { createdAt: 'asc' },
        take: BATCH_SIZE,
      })

      if (messages.length === 0) return

      const ids = messages.map(m => m.id)

      await prisma.outboxMessage.updateMany({
        where: { id: { in: ids }, status: 'pending' },
        data: { status: 'processing' },
      })

      for (const message of messages) {
        await this.processMessage(message)
      }
    } catch (err) {
      logger.error({ err }, 'OutboxProcessor batch failed')
    }
  }

  private async processMessage(message: {
    id: string
    eventName: string
    aggregateId: string
    aggregateType: string
    payload: any
    tenantId: string | null
    retryCount: number
    maxRetries: number
  }): Promise<void> {
    const handlers = this.eventBus.getHandlers(message.eventName)

    if (handlers.length === 0) {
      await prisma.outboxMessage.update({
        where: { id: message.id },
        data: { status: 'sent', processedAt: new Date() },
      })
      return
    }

    const event: DomainEvent = {
      eventName: message.eventName,
      aggregateId: message.aggregateId,
      aggregateType: message.aggregateType,
      occurredOn: new Date(),
    }
    ;(event as any).payload = message.payload

    try {
      await Promise.all(
        handlers.map(handler =>
          handler(event).catch(err => {
            logger.error({ err, eventName: message.eventName, id: message.id }, 'Handler failed')
            throw err
          })
        )
      )

      await prisma.outboxMessage.update({
        where: { id: message.id },
        data: { status: 'sent', processedAt: new Date() },
      })
    } catch (err) {
      const newRetryCount = message.retryCount + 1
      const isDead = newRetryCount >= message.maxRetries

      await prisma.outboxMessage.update({
        where: { id: message.id },
        data: {
          status: isDead ? 'failed' : 'pending',
          retryCount: newRetryCount,
          lastError: err instanceof Error ? err.message : String(err),
          scheduledAt: new Date(Date.now() + this.backoff(newRetryCount)),
        },
      })

      if (isDead) {
        logger.error({ eventName: message.eventName, id: message.id, retryCount: newRetryCount }, 'Event moved to dead letter')
      }
    }
  }

  private backoff(retryCount: number): number {
    return Math.min(1000 * Math.pow(2, retryCount - 1), 30_000)
  }
}