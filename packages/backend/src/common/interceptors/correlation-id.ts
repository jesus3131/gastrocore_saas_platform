import { AsyncLocalStorage } from 'async_hooks'
import { randomUUID } from 'crypto'
import type { Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface Request {
      correlationId: string
    }
  }
}

export const correlationStore = new AsyncLocalStorage<string>()

export function getCorrelationId(): string | undefined {
  return correlationStore.getStore()
}

export function correlationId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers['x-correlation-id'] || req.headers['x-request-id'] || randomUUID()) as string
  req.correlationId = id
  res.setHeader('X-Correlation-ID', id)
  correlationStore.run(id, () => next())
}
