import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requirePermission, requireRole, requireFullAuth, clearPermissionCache } from './permission.guard.js'
import { superAdminGuard } from '../../modules/super-admin/super-admin.guard.js'

vi.mock('../../config/database/prisma.js', () => ({
  prisma: {
    rolePermission: {
      findMany: vi.fn().mockRejectedValue(new Error('DB not available in unit test')),
    },
  },
}))

function mockReq(user?: any) {
  return { user } as any
}

function mockRes() {
  return {} as any
}

describe('requirePermission', () => {
  beforeEach(() => {
    clearPermissionCache()
  })

  it('passes when user has required permissions (fallback to static)', async () => {
    const req = mockReq({ tenantRole: 'manager' })
    const next = vi.fn()

    await requirePermission('pos:read', 'pos:write')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('fails with 403 when user lacks required permissions', async () => {
    const req = mockReq({ tenantRole: 'waiter' })
    const next = vi.fn()

    await requirePermission('inventory:write')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })

  it('fails with 401 when no user', async () => {
    const req = mockReq(null)
    const next = vi.fn()

    await requirePermission('pos:read')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }))
  })

  it('allows any permission for admin role', async () => {
    const req = mockReq({ tenantRole: 'admin' })
    const next = vi.fn()

    await requirePermission('pos:read')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('allows super permission for super_admin role', async () => {
    const req = mockReq({ globalRole: 'super_admin' })
    const next = vi.fn()

    await requirePermission('super:manage')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('rejects non-super permission for super_admin role', async () => {
    const req = mockReq({ globalRole: 'super_admin' })
    const next = vi.fn()

    await requirePermission('pos:read')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })
})

describe('requireFullAuth', () => {
  it('passes when authMethod is password', () => {
    const req = mockReq({ tenantRole: 'admin', authMethod: 'password' })
    const next = vi.fn()

    requireFullAuth(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('passes when authMethod is undefined', () => {
    const req = mockReq({ tenantRole: 'admin' })
    const next = vi.fn()

    requireFullAuth(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('rejects with 403 when authMethod is pin', () => {
    const req = mockReq({ tenantRole: 'waiter', authMethod: 'pin' })
    const next = vi.fn()

    requireFullAuth(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'PIN_NOT_ALLOWED' }))
  })

  it('rejects with 401 when no user', () => {
    const req = mockReq(null)
    const next = vi.fn()

    requireFullAuth(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }))
  })
})

describe('superAdminGuard', () => {
  it('allows super_admin role', () => {
    const req = mockReq({ globalRole: 'super_admin' })
    const next = vi.fn()

    superAdminGuard(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('rejects non super_admin', () => {
    const req = mockReq({ globalRole: 'admin' })
    const next = vi.fn()

    superAdminGuard(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })

  it('rejects when no user', () => {
    const req = mockReq(null)
    const next = vi.fn()

    superAdminGuard(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })
})

describe('requireRole', () => {
  it('passes when user has required role', () => {
    const req = mockReq({ tenantRole: 'waiter' })
    const next = vi.fn()

    requireRole('waiter')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('passes with globalRole when tenantRole absent', () => {
    const req = mockReq({ globalRole: 'super_admin' })
    const next = vi.fn()

    requireRole('super_admin')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('fails with 403 when role does not match', () => {
    const req = mockReq({ tenantRole: 'cashier' })
    const next = vi.fn()

    requireRole('waiter', 'admin')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })

  it('fails with 401 when no user', () => {
    const req = mockReq(null)
    const next = vi.fn()

    requireRole('admin')(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }))
  })
})
