import type { Request, Response, NextFunction } from 'express'
import { ROLE_PERMISSIONS } from '@gastrocore/shared'
import { AppError } from '../filters/error-handler.js'
import { prisma } from '../../config/database/prisma.js'

const rolePermissionCache = new Map<string, { permissions: string[]; expiresAt: number }>()
const CACHE_TTL_MS = 60_000

async function getDbPermissions(role: string): Promise<string[] | null> {
  const cached = rolePermissionCache.get(role)
  if (cached && cached.expiresAt > Date.now()) return cached.permissions

  try {
    const rows = await prisma.rolePermission.findMany({
      where: { role: role as any },
      include: { permission: { select: { name: true } } },
    })
    const perms = rows.map((r) => r.permission.name)
    rolePermissionCache.set(role, { permissions: perms, expiresAt: Date.now() + CACHE_TTL_MS })
    return perms
  } catch {
    return null
  }
}

function clearPermissionCache() {
  rolePermissionCache.clear()
}

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
  return async (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'))
    }

    const resolvedRole = (user.globalRole || user.tenantRole) as string | undefined
    if (!resolvedRole) {
      return next(new AppError(403, 'FORBIDDEN', 'User role missing'))
    }

    if (resolvedRole === 'super_admin') {
      const hasAllSuper = permissions.every((p) => p.startsWith('super:'))
      if (!hasAllSuper) {
        return next(new AppError(403, 'FORBIDDEN', `Super admin lacks required super permissions: ${permissions.join(', ')}`))
      }
      return next()
    }

    const dbPerms = await getDbPermissions(resolvedRole)
    const allowed = dbPerms ?? (ROLE_PERMISSIONS[resolvedRole] || [])

    const hasAll = permissions.every((p) => allowed.includes(p))
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

export { clearPermissionCache }
