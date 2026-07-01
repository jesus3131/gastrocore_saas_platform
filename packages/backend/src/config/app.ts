import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './env.js'
import { connectDatabase } from './database/prisma.js'
import { connectRedis } from './redis/redis.js'
import { errorHandler } from '../common/filters/error-handler.js'
import { requestLogger } from '../common/interceptors/request-logger.js'
import { correlationId } from '../common/interceptors/correlation-id.js'
import { registerRoutes } from './routes.js'
import { registerDependencies } from '../infrastructure/di/container.js'

export async function createApp() {
  registerDependencies()

  const app = express()

  // ─── Connect infrastructure ─────────────────────────────
  await connectDatabase()
  await connectRedis()

  // ─── Global Middleware ──────────────────────────────────
  app.use(helmet())
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
  app.use(express.json({ limit: '10mb' }))
  app.use(rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false }))
  app.use(correlationId)
  app.use(requestLogger)

  // ─── Routes ─────────────────────────────────────────────
  registerRoutes(app)

  // ─── Error Handler ──────────────────────────────────────
  app.use(errorHandler)

  return app
}
