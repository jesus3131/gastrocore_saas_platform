import type { Request, Response, NextFunction } from 'express'
import { logger } from '../../config/logger.js'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      tenantId: req.headers['x-tenant-id'],
      correlationId: req.correlationId,
    }, 'HTTP Request')
  })
  next()
}
