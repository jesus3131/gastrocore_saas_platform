import type { Request, Response, NextFunction } from 'express'
import type { EmployeeRole } from '@gastrocore/shared'
import { ROLE_PERMISSIONS } from '@gastrocore/shared'
import { AppError } from '../filters/error-handler.js'

/**
 * Rejects PIN-authenticated requests for operations that need full credentials.
 */
export function requireFullAuth(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.authMethod === 'pin') {
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

    const role = user.role as EmployeeRole
    const allowed = ROLE_PERMISSIONS[role] || []

    const hasAll = permissions.every(p => allowed.includes('*') || allowed.includes(p))
    if (!hasAll) {
      return next(
        new AppError(403, 'FORBIDDEN', `Role '${role}' lacks required permissions: ${permissions.join(', ')}`)
      )
    }

    next()
  }
}

export function requireRole(...roles: EmployeeRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'))
    }

    if (!roles.includes(user.role as EmployeeRole)) {
      return next(
        new AppError(403, 'FORBIDDEN', `Role '${user.role}' not allowed. Required: ${roles.join(', ')}`)
      )
    }

    next()
  }
}
