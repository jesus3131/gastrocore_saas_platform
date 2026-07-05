import 'reflect-metadata'
import { describe, it, expect, vi } from 'vitest'
import { correlationId, getCorrelationId } from './correlation-id.js'
import type { Request, Response } from 'express'

function mockReq(headers: Record<string, string> = {}) {
  return { headers, setHeader: vi.fn(), correlationId: '' } as unknown as Request
}

function mockRes() {
  return { setHeader: vi.fn() } as unknown as Response
}

describe('correlationId', () => {
  it('generates a UUID when no header present', () => {
    const req = mockReq()
    const res = mockRes()
    const next = vi.fn()

    correlationId(req, res, next)

    expect(req.correlationId).toBeTruthy()
    expect(req.correlationId).toMatch(/^[0-9a-f-]{36}$/)
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', req.correlationId)
    expect(next).toHaveBeenCalledOnce()
  })

  it('uses x-correlation-id header when present', () => {
    const req = mockReq({ 'x-correlation-id': 'custom-id-123' })
    const res = mockRes()
    const next = vi.fn()

    correlationId(req, res, next)

    expect(req.correlationId).toBe('custom-id-123')
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'custom-id-123')
  })

  it('falls back to x-request-id header', () => {
    const req = mockReq({ 'x-request-id': 'req-id-456' })
    const res = mockRes()
    const next = vi.fn()

    correlationId(req, res, next)

    expect(req.correlationId).toBe('req-id-456')
  })

  it('sets response header with generated id', () => {
    const req = mockReq()
    const res = mockRes()
    const next = vi.fn()

    correlationId(req, res, next)

    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', req.correlationId)
  })
})
