import type { Request, Response, NextFunction } from 'express'
import { TenantContext } from '../context/tenant.context.js'

export function tenantIsolationMiddleware(req: Request, _res: Response, next: NextFunction) {
  const tenantId = req.tenantId ?? (req.headers['x-tenant-id'] as string | undefined) ?? null
  TenantContext.run(tenantId, () => next())
}
