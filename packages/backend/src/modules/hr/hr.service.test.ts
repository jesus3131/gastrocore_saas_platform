import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError } from '../../common/filters/error-handler.js'

vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn(() => 'mock-pin-token') },
}))

vi.mock('../../config/env.js', () => ({
  env: {
    JWT_SECRET: 'test-secret-at-least-32-characters-long!!',
    JWT_EXPIRATION: '15m',
    LOG_LEVEL: 'silent',
    NODE_ENV: 'test',
  },
}))

vi.mock('../../config/database/prisma.js', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

vi.mock('../../infrastructure/di/container.js', () => ({
  container: {
    resolve: vi.fn(),
  },
}))

import jwt from 'jsonwebtoken'
import { prisma } from '../../config/database/prisma.js'
import { container } from '../../infrastructure/di/container.js'
import { HrService } from './hr.service.js'

function makeSut() {
  const mockEmployeeRepo = {
    findMany: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    findByPin: vi.fn(),
    findManyShifts: vi.fn(),
    createShift: vi.fn(),
    updateShift: vi.fn(),
    findManyCommissions: vi.fn(),
  }

  const service = new HrService(mockEmployeeRepo as any)
  return { service, mockEmployeeRepo }
}

const mockEmployee = {
  id: 'emp-1',
  tenantId: 'tenant-1',
  name: 'Carlos García',
  email: 'carlos@lacocina.com',
  role: 'cashier',
  branchId: 'branch-1',
  pin: '1234',
  isActive: true,
}

const mockShift = {
  id: 'shift-1',
  employeeId: 'emp-1',
  tenantId: 'tenant-1',
  startTime: new Date('2026-01-01T08:00:00'),
  endTime: new Date('2026-01-01T16:00:00'),
  status: 'completed',
}

describe('HrService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getEmployees', () => {
    it('returns employees list', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.findMany.mockResolvedValue([mockEmployee])

      const result = await service.getEmployees('tenant-1')

      expect(mockEmployeeRepo.findMany).toHaveBeenCalledWith('tenant-1', undefined)
      expect(result).toEqual([mockEmployee])
    })

    it('passes pagination options', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.findMany.mockResolvedValue([])

      await service.getEmployees('tenant-1', { limit: 10, offset: 20 })

      expect(mockEmployeeRepo.findMany).toHaveBeenCalledWith('tenant-1', { limit: 10, offset: 20 })
    })
  })

  describe('createEmployee', () => {
    it('delegates to CreateEmployeeUseCase via container', async () => {
      const { service } = makeSut()
      const mockUseCase = { execute: vi.fn().mockResolvedValue(mockEmployee) }
      vi.mocked(container.resolve).mockReturnValue(mockUseCase as any)

      const result = await service.createEmployee('tenant-1', {
        name: 'Carlos García',
        email: 'carlos@lacocina.com',
        role: 'cashier',
      })

      expect(container.resolve).toHaveBeenCalled()
      expect(mockUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
        tenantId: 'tenant-1',
        name: 'Carlos García',
      }))
      expect(result).toEqual(mockEmployee)
    })
  })

  describe('updateEmployee', () => {
    it('updates existing employee', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.findById.mockResolvedValue(mockEmployee)
      mockEmployeeRepo.update.mockResolvedValue({ ...mockEmployee, name: 'Carlos G.' })

      const result = await service.updateEmployee('tenant-1', 'emp-1', { name: 'Carlos G.' })

      expect(mockEmployeeRepo.findById).toHaveBeenCalledWith('tenant-1', 'emp-1')
      expect(mockEmployeeRepo.update).toHaveBeenCalledWith('tenant-1', 'emp-1', { name: 'Carlos G.' })
      expect(result.name).toBe('Carlos G.')
    })

    it('throws 404 when employee not found', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.findById.mockResolvedValue(null)

      await expect(service.updateEmployee('tenant-1', 'bad-id', {}))
        .rejects.toMatchObject({ statusCode: 404, code: 'EMPLOYEE_NOT_FOUND' })
    })
  })

  describe('deleteEmployee', () => {
    it('deactivates employee and their linked user', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.findById.mockResolvedValue(mockEmployee)
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-2' } as any)
      vi.mocked(prisma.user.updateMany).mockResolvedValue({ count: 1 } as any)
      mockEmployeeRepo.update.mockResolvedValue({ ...mockEmployee, isActive: false })

      const result = await service.deleteEmployee('tenant-1', 'emp-1', 'user-1')

      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1', tenantId: 'tenant-1' },
        data: { isActive: false },
      })
      expect(mockEmployeeRepo.update).toHaveBeenCalledWith('tenant-1', 'emp-1', { isActive: false })
      expect(result.isActive).toBe(false)
    })

    it('throws 403 when trying to delete own account', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.findById.mockResolvedValue(mockEmployee)
      // linked user is the current user
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'current-user-1' } as any)

      await expect(service.deleteEmployee('tenant-1', 'emp-1', 'current-user-1'))
        .rejects.toMatchObject({ statusCode: 403, code: 'SELF_DELETE_FORBIDDEN' })
    })

    it('throws 404 when employee not found', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.findById.mockResolvedValue(null)

      await expect(service.deleteEmployee('tenant-1', 'bad-id', 'user-1'))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('verifyPin', () => {
    it('returns employee and signed token for valid PIN', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.findByPin.mockResolvedValue(mockEmployee)

      const result = await service.verifyPin('tenant-1', '1234', 'cashier')

      expect(mockEmployeeRepo.findByPin).toHaveBeenCalledWith('tenant-1', '1234', 'cashier')
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'emp-1',
          tenantId: 'tenant-1',
          tenantRole: 'cashier',
          authMethod: 'pin',
        }),
        expect.any(String),
        expect.any(Object),
      )
      expect(result.token).toBe('mock-pin-token')
      expect(result.employee).toEqual(mockEmployee)
    })

    it('throws 401 when PIN is invalid', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.findByPin.mockResolvedValue(null)

      await expect(service.verifyPin('tenant-1', '0000'))
        .rejects.toMatchObject({ statusCode: 401, code: 'INVALID_PIN' })
    })
  })

  describe('getShifts', () => {
    it('returns shifts list with pagination', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.findManyShifts.mockResolvedValue([mockShift])

      const result = await service.getShifts('tenant-1', { limit: 5, offset: 0 })

      expect(mockEmployeeRepo.findManyShifts).toHaveBeenCalledWith('tenant-1', { limit: 5, offset: 0 })
      expect(result).toEqual([mockShift])
    })
  })

  describe('createShift', () => {
    it('creates a shift with tenantId injected', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.createShift.mockResolvedValue(mockShift)

      const result = await service.createShift('tenant-1', {
        employeeId: 'emp-1',
        startTime: new Date('2026-01-01T08:00:00'),
      })

      expect(mockEmployeeRepo.createShift).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'tenant-1', employeeId: 'emp-1' }),
      )
      expect(result).toEqual(mockShift)
    })
  })

  describe('updateShiftStatus', () => {
    it('updates shift status', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      mockEmployeeRepo.updateShift.mockResolvedValue({ ...mockShift, status: 'cancelled' })

      const result = await service.updateShiftStatus('tenant-1', 'shift-1', 'cancelled')

      expect(mockEmployeeRepo.updateShift).toHaveBeenCalledWith('shift-1', { status: 'cancelled' })
      expect(result.status).toBe('cancelled')
    })
  })

  describe('getRoles', () => {
    it('returns all role-permission mappings', async () => {
      const { service } = makeSut()

      const result = await service.getRoles()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('role')
      expect(result[0]).toHaveProperty('permissions')
    })
  })

  describe('getCommissions', () => {
    it('returns commissions list', async () => {
      const { service, mockEmployeeRepo } = makeSut()
      const commissions = [{ id: 'comm-1', employeeId: 'emp-1', amount: 150 }]
      mockEmployeeRepo.findManyCommissions.mockResolvedValue(commissions)

      const result = await service.getCommissions('tenant-1')

      expect(mockEmployeeRepo.findManyCommissions).toHaveBeenCalledWith('tenant-1', undefined)
      expect(result).toEqual(commissions)
    })
  })
})
