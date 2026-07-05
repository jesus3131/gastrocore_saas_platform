import 'reflect-metadata'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { requireTenantAdmin } from './auth.guard.js'

function mockReq(user?: any) {
  return { user, headers: {}, tenantId: undefined } as any
}

function mockRes() {
  return {} as any
}

describe('requireTenantAdmin', () => {
  it('passes when user is admin with tenantId', async () => {
    const req = mockReq({ tenantRole: 'admin', tenantId: 'tenant-1' })
    const next = vi.fn()

    await requireTenantAdmin(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith()
    expect(req.tenantId).toBe('tenant-1')
  })

  it('rejects super_admin', async () => {
    const req = mockReq({ globalRole: 'super_admin' })
    const next = vi.fn()

    await requireTenantAdmin(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })

  it('rejects waiter role', async () => {
    const req = mockReq({ tenantRole: 'waiter', tenantId: 'tenant-1' })
    const next = vi.fn()

    await requireTenantAdmin(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })

  it('rejects admin without tenantId', async () => {
    const req = mockReq({ tenantRole: 'admin' })
    const next = vi.fn()

    await requireTenantAdmin(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }))
  })

  it('rejects with 401 when no user', async () => {
    const req = mockReq(null)
    const next = vi.fn()

    await requireTenantAdmin(req, mockRes(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }))
  })
})
