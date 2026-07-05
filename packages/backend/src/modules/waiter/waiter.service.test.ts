import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WaiterService } from './waiter.service.js'
import { AppError } from '../../common/filters/error-handler.js'

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock-jwt-token'),
  },
}))

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

function makeSut() {
  const mockUserRepo = {
    findByEmail: vi.fn(),
  }
  const mockEmployeeRepo = {
    findById: vi.fn(),
  }
  const mockOrderRepo = {
    findActiveByTable: vi.fn(),
    findActiveByTables: vi.fn(),
    findById: vi.fn(),
    updatePaymentMethod: vi.fn(),
    updateStatus: vi.fn(),
  }
  const mockMenuRepo = {
    getMenu: vi.fn(),
  }
  const mockTableRepo = {
    findAllWithBranches: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  }
  const mockPaymentRepo = {
    create: vi.fn(),
  }
  const mockCreateOrderUseCase = {
    execute: vi.fn(),
  }
  const mockTenantRepo = {
    findBySlug: vi.fn(),
    findManyTenants: vi.fn(),
  }

  const service = new WaiterService(
    mockCreateOrderUseCase as any,
    mockUserRepo as any,
    mockEmployeeRepo as any,
    mockOrderRepo as any,
    mockMenuRepo as any,
    mockTableRepo as any,
    mockPaymentRepo as any,
    mockTenantRepo as any,
  )

  return { service, mockUserRepo, mockEmployeeRepo, mockOrderRepo, mockMenuRepo, mockTableRepo, mockPaymentRepo, mockCreateOrderUseCase }
}

const mockUser = {
  id: 'user-1',
  tenantId: 'tenant-1',
  email: 'mesero@lacocina.com',
  name: 'Pedro',
  tenantRole: 'waiter',
  passwordHash: '$2b$12$hashed',
  isActive: true,
  employeeId: 'emp-1',
}

const mockEmployee = {
  id: 'emp-1',
  tenantId: 'tenant-1',
  branchId: 'branch-1',
  name: 'Pedro Sánchez',
  email: 'mesero@lacocina.com',
  role: 'waiter',
}

const mockMenu = {
  categories: [
    { id: 'cat-1', name: 'Entradas', items: [{ id: 'item-1', name: 'Bruschetta', price: 89 }] },
  ],
}

const mockBranches = [
  {
    id: 'branch-1',
    name: 'Sucursal Centro',
    areas: [
      {
        id: 'area-1',
        name: 'Salón Principal',
        tables: [
          { id: 'table-1', label: 'M1', capacity: 2, status: 'available' },
          { id: 'table-2', label: 'M2', capacity: 4, status: 'occupied' },
        ],
      },
    ],
  },
]

const mockOrder = {
  id: 'order-1',
  tableId: 'table-1',
  tenantId: 'tenant-1',
  total: 206.20,
  status: 'pending',
  items: [{ id: 'oi-1', name: 'Pasta', quantity: 2, unitPrice: 89 }],
}

describe('WaiterService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('returns token and user when credentials are valid', async () => {
      const { service, mockUserRepo, mockEmployeeRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      mockEmployeeRepo.findById.mockResolvedValue(mockEmployee)

      const result = await service.login('mesero@lacocina.com', 'mesero123', 'tenant-1')

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('mesero@lacocina.com', 'tenant-1')
      expect(bcrypt.compare).toHaveBeenCalledWith('mesero123', mockUser.passwordHash)
      expect(mockEmployeeRepo.findById).toHaveBeenCalledWith('tenant-1', 'emp-1')
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1', tenantRole: 'waiter', branchId: 'branch-1' }),
        expect.any(String),
        expect.any(Object),
      )
      expect(result.token).toBe('mock-jwt-token')
      expect(result.user.branchId).toBe('branch-1')
    })

    it('throws 401 when user not found', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(null)

      await expect(service.login('bad@email.com', 'pass', 'tenant-1')).rejects.toThrow(AppError)
      await expect(service.login('bad@email.com', 'pass', 'tenant-1')).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 401 when user is inactive', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, isActive: false })

      await expect(service.login('mesero@lacocina.com', 'pass', 'tenant-1')).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 401 when user has no tenantId', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, tenantId: null })

      await expect(service.login('super@admin.com', 'pass')).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 403 when user is not a waiter', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, tenantRole: 'admin' })

      await expect(service.login('admin@lacocina.com', 'pass', 'tenant-1')).rejects.toMatchObject({ statusCode: 403 })
    })

    it('throws 401 when password is wrong', async () => {
      const { service, mockUserRepo } = makeSut()
      mockUserRepo.findByEmail.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(service.login('mesero@lacocina.com', 'wrong', 'tenant-1')).rejects.toMatchObject({ statusCode: 401 })
    })
  })

  describe('getMenu', () => {
    it('returns menu from repository', async () => {
      const { service, mockMenuRepo } = makeSut()
      mockMenuRepo.getMenu.mockResolvedValue(mockMenu)

      const result = await service.getMenu('tenant-1')

      expect(mockMenuRepo.getMenu).toHaveBeenCalledWith('tenant-1')
      expect(result).toEqual(mockMenu)
    })
  })

  describe('getTables', () => {
    it('returns all branches with tables and active orders', async () => {
      const { service, mockTableRepo, mockOrderRepo } = makeSut()
      mockTableRepo.findAllWithBranches.mockResolvedValue(mockBranches as any)
      mockOrderRepo.findActiveByTables.mockResolvedValue([{ tableId: 'table-2', id: 'order-1', total: 150, status: 'pending' }])

      const result = await service.getTables('tenant-1')

      expect(mockTableRepo.findAllWithBranches).toHaveBeenCalledWith('tenant-1')
      expect(mockOrderRepo.findActiveByTables).toHaveBeenCalledWith(['table-1', 'table-2'])
      const r0 = result[0] as any
      expect(r0.areas[0].tables[0].activeOrder).toBeNull()
      expect(r0.areas[0].tables[1].activeOrder).toEqual({ id: 'order-1', total: 150, status: 'pending' })
    })

    it('filters by branchId when provided', async () => {
      const { service, mockTableRepo, mockOrderRepo } = makeSut()
      mockTableRepo.findAllWithBranches.mockResolvedValue(mockBranches as any)
      mockOrderRepo.findActiveByTables.mockResolvedValue([])

      const result = await service.getTables('tenant-1', 'branch-1')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('branch-1')
    })
  })

  describe('createOrder', () => {
    it('delegates to CreateOrderUseCase', async () => {
      const { service, mockCreateOrderUseCase } = makeSut()
      const orderInput = {
        branchId: 'branch-1',
        tableId: 'table-1',
        type: 'dine_in',
        subtotal: 178,
        tax: 28.48,
        total: 206.48,
        items: [{ menuItemId: 'item-1', name: 'Pasta', quantity: 2, unitPrice: 89 }],
      }
      mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder)

      const result = await service.createOrder('tenant-1', orderInput, 'user-1')

      expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          tableId: 'table-1',
          total: 206.48,
        }),
      )
      expect(result).toEqual(mockOrder)
    })
  })

  describe('requestBill', () => {
    it('updates table status to bill_requested and returns active order', async () => {
      const { service, mockTableRepo, mockOrderRepo } = makeSut()
      mockTableRepo.findById.mockResolvedValue({ id: 'table-1', label: 'M1' })
      mockOrderRepo.findActiveByTable.mockResolvedValue(mockOrder)
      mockTableRepo.updateStatus.mockResolvedValue({ id: 'table-1', status: 'bill_requested' })

      const result = await service.requestBill('tenant-1', 'table-1')

      expect(mockTableRepo.findById).toHaveBeenCalledWith('tenant-1', 'table-1')
      expect(mockOrderRepo.findActiveByTable).toHaveBeenCalledWith('tenant-1', 'table-1')
      expect(mockTableRepo.updateStatus).toHaveBeenCalledWith('tenant-1', 'table-1', 'bill_requested')
      expect(result).toEqual(mockOrder)
    })

    it('throws 404 when table not found', async () => {
      const { service, mockTableRepo } = makeSut()
      mockTableRepo.findById.mockResolvedValue(null)

      await expect(service.requestBill('tenant-1', 'table-99')).rejects.toMatchObject({ statusCode: 404 })
    })

    it('throws 404 when no active order', async () => {
      const { service, mockTableRepo, mockOrderRepo } = makeSut()
      mockTableRepo.findById.mockResolvedValue({ id: 'table-1', label: 'M1' })
      mockOrderRepo.findActiveByTable.mockResolvedValue(null)

      await expect(service.requestBill('tenant-1', 'table-1')).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('processPayment', () => {
    const paymentInput = { method: 'card', tip: 30, paidAmount: 236.20 }

    it('creates payment, marks order paid, and frees table', async () => {
      const { service, mockTableRepo, mockOrderRepo, mockPaymentRepo } = makeSut()
      mockTableRepo.findById.mockResolvedValue({ id: 'table-1', label: 'M1' })
      mockOrderRepo.findActiveByTable.mockResolvedValue(mockOrder)
      mockOrderRepo.findById.mockResolvedValue(mockOrder)
      mockPaymentRepo.create.mockResolvedValue({ id: 'payment-1', ...paymentInput, status: 'completed' })

      const result = await service.processPayment('tenant-1', 'table-1', paymentInput)

      expect(mockPaymentRepo.create).toHaveBeenCalledWith({
        tenantId: 'tenant-1',
        orderId: 'order-1',
        method: 'card',
        amount: 236.20,
        status: 'completed',
        metadata: { tip: 30 },
      })
      expect(mockOrderRepo.updatePaymentMethod).toHaveBeenCalledWith('order-1', 'card')
      expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('order-1', 'paid')
      expect(mockTableRepo.updateStatus).toHaveBeenCalledWith('tenant-1', 'table-1', 'available')
      expect(result.payment).toBeDefined()
      expect(result.table).toBe('M1')
    })

    it('throws 404 when table not found', async () => {
      const { service, mockTableRepo } = makeSut()
      mockTableRepo.findById.mockResolvedValue(null)

      await expect(service.processPayment('tenant-1', 'table-99', paymentInput)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('throws 404 when no active order', async () => {
      const { service, mockTableRepo, mockOrderRepo } = makeSut()
      mockTableRepo.findById.mockResolvedValue({ id: 'table-1', label: 'M1' })
      mockOrderRepo.findActiveByTable.mockResolvedValue(null)

      await expect(service.processPayment('tenant-1', 'table-1', paymentInput)).rejects.toMatchObject({ statusCode: 404 })
    })
  })
})
