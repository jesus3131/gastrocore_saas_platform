import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import type { Server } from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

// Telemetry must initialize before PrismaClient is created
await import('./infrastructure/observability/instrumentation.js')

const [{ createApp }, { logger }, { env }, { disconnectDatabase }, { disconnectRedis }] = await Promise.all([
  import('./config/app.js'),
  import('./config/logger.js'),
  import('./config/env.js'),
  import('./config/database/prisma.js'),
  import('./config/redis/redis.js'),
])

const [{ container }, { WebSocketGateway }, { OutboxProcessor }, { OutboxEventBus }, { EventBroadcaster }] = await Promise.all([
  import('./infrastructure/di/container.js'),
  import('./infrastructure/websocket/websocket-gateway.js'),
  import('./infrastructure/events/outbox-processor.js'),
  import('./infrastructure/events/outbox-event-bus.js'),
  import('./infrastructure/websocket/event-broadcaster.js'),
])

let server: Server

async function bootstrap() {
  const app = await createApp()
  server = createServer(app)

  // Auto-seed on first-ever deployment (empty database)
  try {
    const { prisma } = await import('./config/database/prisma.js')
    const tenantCount = await prisma.tenant.count()
    if (tenantCount === 0) {
      logger.info('Empty database detected — running seed...')
      const { execSync } = await import('child_process')
      execSync('pnpm exec tsx prisma/seed.ts', { stdio: 'inherit', cwd: process.cwd() })
      logger.info('Seed completed')
    }
  } catch (err) {
    logger.warn({ err }, 'Auto-seed skipped or failed (non-fatal)')
  }

  const gateway = new WebSocketGateway()
  gateway.initialize(server)

  const eventStore = container.resolve<import('./core/ports/event-store.js').EventStore>('EventStore')
  const eventBus = container.resolve<import('./core/ports/event-bus.js').EventBus>('EventBus')
  const outboxEventBus = container.resolve(OutboxEventBus)

  new EventBroadcaster(eventBus, gateway).start()
  new OutboxProcessor(outboxEventBus).start()

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'GastroCore API started')
  })
}

async function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received')

  server?.close(async (err) => {
    if (err) {
      logger.error(err, 'Error closing HTTP server')
    } else {
      logger.info('HTTP server closed')
    }

    await Promise.allSettled([
      disconnectDatabase(),
      disconnectRedis(),
    ])

    logger.info('Graceful shutdown complete')
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught exception — shutting down')
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection — shutting down')
  gracefulShutdown('unhandledRejection')
})

bootstrap()
