import type { Request, Response, NextFunction } from 'express'
import type { EmployeeRole } from '@gastrocore/shared'
import { ROLE_PERMISSIONS } from '@gastrocore/shared'
import { AppError } from '../filters/error-handler.js'

/**
 * Rejects PIN-authenticated requests for operations that need full credentials.
 */
export function requireFullAuth(req: Request, _res: Response, next: NextFunction) {
  const user = req.user
  if (!user) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'))
  }
  if (user.authMethod === 'pin') {
    return next(new AppError(403, 'PIN_NOT_ALLOWED', 'PIN authentication not allowed for this operation'))
  }
  next()
}

export function requirePermission(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'))
    }

    const resolvedRole = (user.globalRole || user.tenantRole) as string | undefined
    if (!resolvedRole) {
      return next(new AppError(403, 'FORBIDDEN', 'User role missing'))
    }

    const allowed = ROLE_PERMISSIONS[resolvedRole] || []

    const hasAll = permissions.every((p) => allowed.includes(p) || (resolvedRole === 'super_admin' && p.startsWith('super:')))
    if (!hasAll) {
      return next(
        new AppError(403, 'FORBIDDEN', `Role '${resolvedRole}' lacks required permissions: ${permissions.join(', ')}`)
      )
    }

    next()
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'))
    }

    const userRole = (user.globalRole || user.tenantRole) as string
    if (!roles.includes(userRole)) {
      return next(
        new AppError(403, 'FORBIDDEN', `Role '${userRole}' not allowed. Required: ${roles.join(', ')}`)
      )
    }

    next()
  }
}
