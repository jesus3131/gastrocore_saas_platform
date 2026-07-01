import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from '@gastrocore/shared'
import { env } from '../../config/env.js'
import { AppError } from '../filters/error-handler.js'
import { prisma } from '../../config/database/prisma.js'

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
      tenantId?: string
    }
  }
}

export async function authGuard(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header'))
    }

    const token = header.slice(7)
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = payload
    req.tenantId = payload.tenantId

    // Super Admin doesn't need tenantId; all others must have one
    if (payload.role !== 'super_admin' && !payload.tenantId) {
      return next(new AppError(401, 'INVALID_TOKEN', 'Token missing tenant association'))
    }

    // For non-super-admin, validate x-tenant-id matches the token's tenant
    const headerTenantId = req.headers['x-tenant-id'] as string | undefined
    if (headerTenantId && payload.role !== 'super_admin' && headerTenantId !== payload.tenantId) {
      return next(new AppError(403, 'TENANT_MISMATCH', 'x-tenant-id does not match your tenant'))
    }

    next()
  } catch {
    return next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'))
  }
}

/**
 * Ensures the authenticated user is an admin of the tenant in the request.
 * Blocks super_admin (who must use super-admin routes) and non-admin roles.
 */
export async function requireTenantAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = req.user
    if (!user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'))
    }
    if (user.role === 'super_admin') {
      return next(new AppError(403, 'FORBIDDEN', 'Super Admin cannot manage tenant employees. Use Super Admin panel.'))
    }
    if (user.role !== 'admin') {
      return next(new AppError(403, 'FORBIDDEN', `Role '${user.role}' is not allowed to manage employees`))
    }
    if (!user.tenantId) {
      return next(new AppError(403, 'FORBIDDEN', 'Admin without tenant association'))
    }
    // x-tenant-id header must match the admin's tenant
    const headerTenant = req.headers['x-tenant-id'] as string | undefined
    if (headerTenant && headerTenant !== user.tenantId) {
      return next(new AppError(403, 'TENANT_MISMATCH', 'x-tenant-id does not match your tenant'))
    }
    req.tenantId = user.tenantId
    next()
  } catch (err) {
    return next(err)
  }
}

export async function tenantGuard(req: Request, _res: Response, next: NextFunction) {
  try {
    const tenantId = req.headers['x-tenant-id'] as string
    if (!tenantId) {
      return next(new AppError(400, 'TENANT_REQUIRED', 'x-tenant-id header is required'))
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant || tenant.subscriptionStatus === 'canceled') {
      return next(new AppError(403, 'TENANT_INACTIVE', 'Tenant is not active'))
    }

    req.tenantId = tenantId
    next()
  } catch (err) {
    return next(err)
  }
}
