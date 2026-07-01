import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../../common/filters/error-handler.js'
import { authGuard } from '../../common/guards/auth.guard.js'

export function superAdminGuard(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.globalRole !== 'super_admin') {
    return next(new AppError(403, 'FORBIDDEN', 'Only super admins can access this resource'))
  }
  next()
}

export async function superAdminAuth(req: Request, res: Response, next: NextFunction) {
  await authGuard(req, res, (err: unknown) => {
    if (err) return next(err)
    superAdminGuard(req, res, next)
  })
}
