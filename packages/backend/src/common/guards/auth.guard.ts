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

    const headerTenantId = req.headers['x-tenant-id'] as string | undefined
    if (headerTenantId && payload.role !== 'super_admin' && headerTenantId !== payload.tenantId) {
      return next(new AppError(403, 'TENANT_MISMATCH', 'x-tenant-id does not match your tenant'))
    }

    next()
  } catch {
    return next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'))
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
