import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import type { Server } from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const [{ createApp }, { logger }, { env }, { disconnectDatabase }, { disconnectRedis }] = await Promise.all([
  import('./config/app.js'),
  import('./config/logger.js'),
  import('./config/env.js'),
  import('./config/database/prisma.js'),
  import('./config/redis/redis.js'),
])

let server: Server

async function bootstrap() {
  const app = await createApp()
  server = createServer(app)

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
