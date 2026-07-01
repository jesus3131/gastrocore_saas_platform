import 'reflect-metadata'
import { describe, it, expect, vi } from 'vitest'
import { requirePermission, requireRole } from './permission.guard.js'
import { superAdminGuard } from '../../modules/super-admin/super-admin.guard.js'

function mockReq(user?: any) {
  return { user } as any
}

function mockRes() {
  return {} as any
}

describe('requirePermission', () => {
  it('passes when user has required permissions', () => {
    const req = mockReq({ role: 'manager' })
    const next = vi.fn()

    requirePermission('pos:read', 'pos:write')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('fails with 403 when user lacks required permissions', () => {
    const req = mockReq({ role: 'waiter' })
    const next = vi.fn()

    requirePermission('inventory:write')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })

  it('fails with 401 when no user', () => {
    const req = mockReq(null)
    const next = vi.fn()

    requirePermission('pos:read')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }))
  })

  it('allows explicit module permissions for admin role', () => {
    const req = mockReq({ tenantRole: 'admin' })
    const next = vi.fn()

    requirePermission('pos:read')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('blocks super:* permissions for admin role', () => {
    const req = mockReq({ tenantRole: 'admin' })
    const next = vi.fn()

    requirePermission('super:manage')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })

  it('allows super:* permissions for super_admin role', () => {
    const req = mockReq({ globalRole: 'super_admin' })
    const next = vi.fn()

    requirePermission('super:manage')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })
})

describe('superAdminGuard', () => {
  it('allows super admins identified by globalRole', () => {
    const req = mockReq({ globalRole: 'super_admin' })
    const next = vi.fn()

    superAdminGuard(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })
})

describe('requireRole', () => {
  it('passes when user has required role', () => {
    const req = mockReq({ role: 'admin' })
    const next = vi.fn()

    requireRole('admin', 'manager')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('fails with 403 when user role not in allowed list', () => {
    const req = mockReq({ role: 'waiter' })
    const next = vi.fn()

    requireRole('admin', 'manager')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })

  it('fails with 401 when no user', () => {
    const req = mockReq(null)
    const next = vi.fn()

    requireRole('admin')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }))
  })
})
