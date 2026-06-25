import { createApp } from './config/app.js'
import { logger } from './config/logger.js'
import { env } from './config/env.js'

async function bootstrap() {
  const app = await createApp()

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, '🚀 GastroCore API started')
  })

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received')
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

bootstrap().catch((err) => {
  logger.error(err, 'Fatal error during bootstrap')
  process.exit(1)
})
