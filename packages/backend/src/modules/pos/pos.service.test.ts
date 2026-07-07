import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PosService } from './pos.service.js'
import { AppError } from '../../common/filters/error-handler.js'

function makeSut() {
  const mockCreateOrderUseCase = {
    execute: vi.fn(),
  }
  const mockOrderRepo = {
    findMany: vi.fn(),
    findById: vi.fn(),
    findActiveByTables: vi.fn(),
    updateStatus: vi.fn(),
    updatePaymentMethod: vi.fn(),
  }
  const mockMenuRepo = {
    getMenu: vi.fn(),
    getMenuItems: vi.fn(),
  }
  const mockTableRepo = {
    findAllWithBranches: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
    clearWaiter: vi.fn(),
  }
  const mockPaymentRepo = {
    create: vi.fn(),
    updateByOrder: vi.fn(),
    createMany: vi.fn(),
  }
  const mockEventBus = {
    publish: vi.fn(),
    subscribe: vi.fn(),
    getHandlers: vi.fn(() => []),
    hasSubscribers: vi.fn(() => false),
  }

  const service = new PosService(
    mockCreateOrderUseCase as any,
    mockOrderRepo as any,
    mockMenuRepo as any,
    mockTableRepo as any,
    mockPaymentRepo as any,
    mockEventBus as any,
  )

  return { service, mockCreateOrderUseCase, mockOrderRepo, mockMenuRepo, mockTableRepo, mockPaymentRepo, mockEventBus }
}

const mockOrder = {
  id: 'order-1',
  tenantId: 'tenant-1',
  tableId: 'table-1',
  total: 206.20,
  paymentMethod: null,
  status: 'pending',
  items: [{ id: 'oi-1', name: 'Pasta', quantity: 2, unitPrice: 89, totalPrice: 178 }],
}

const mockBranches = [
  {
    id: 'branch-1',
    name: 'Centro',
    areas: [
      {
        id: 'area-1',
        name: 'Salon',
        tables: [
          { id: 'table-1', label: 'M1', status: 'available' },
          { id: 'table-2', label: 'M2', status: 'occupied' },
        ],
      },
    ],
  },
]

const mockMenu = {
  categories: [{ id: 'cat-1', name: 'Entradas', items: [{ id: 'item-1', name: 'Sopa', price: 89 }] }],
}

describe('PosService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  describe('getMenuItems', () => {
    it('returns menu items for a category', async () => {
      const { service, mockMenuRepo } = makeSut()
      const items = [{ id: 'item-1', name: 'Sopa', price: 89 }]
      mockMenuRepo.getMenuItems.mockResolvedValue(items)

      const result = await service.getMenuItems('tenant-1', 'cat-1')

      expect(mockMenuRepo.getMenuItems).toHaveBeenCalledWith('tenant-1', 'cat-1')
      expect(result).toEqual(items)
    })
  })

  describe('getTables', () => {
    it('returns branches with tables enriched with active orders', async () => {
      const { service, mockTableRepo, mockOrderRepo } = makeSut()
      mockTableRepo.findAllWithBranches.mockResolvedValue(mockBranches as any)
      mockOrderRepo.findActiveByTables.mockResolvedValue([
        { tableId: 'table-2', id: 'order-1', total: 150, status: 'pending' },
      ])

      const result = await service.getTables('tenant-1')

      const r0 = result[0] as any
      expect(r0.areas[0].tables[0].activeOrder).toBeNull()
      expect(r0.areas[0].tables[1].activeOrder).toEqual({ id: 'order-1', total: 150, status: 'pending' })
    })

    it('returns empty active orders when no tables exist', async () => {
      const { service, mockTableRepo, mockOrderRepo } = makeSut()
      mockTableRepo.findAllWithBranches.mockResolvedValue([])

      await service.getTables('tenant-1')

      expect(mockOrderRepo.findActiveByTables).not.toHaveBeenCalled()
    })
  })

  describe('updateTableStatus', () => {
    it('updates table status', async () => {
      const { service, mockTableRepo } = makeSut()
      mockTableRepo.findById.mockResolvedValue({ id: 'table-1', label: 'M1' })
      mockTableRepo.updateStatus.mockResolvedValue({ id: 'table-1', status: 'occupied' })

      const result = await service.updateTableStatus('tenant-1', 'table-1', 'occupied')

      expect(mockTableRepo.findById).toHaveBeenCalledWith('tenant-1', 'table-1')
      expect(mockTableRepo.updateStatus).toHaveBeenCalledWith('tenant-1', 'table-1', 'occupied')
    })

    it('throws 404 when table not found', async () => {
      const { service, mockTableRepo } = makeSut()
      mockTableRepo.findById.mockResolvedValue(null)

      await expect(service.updateTableStatus('tenant-1', 'bad-id', 'occupied'))
        .rejects.toMatchObject({ statusCode: 404, code: 'TABLE_NOT_FOUND' })
    })
  })

  describe('getOrders', () => {
    it('returns orders list', async () => {
      const { service, mockOrderRepo } = makeSut()
      mockOrderRepo.findMany.mockResolvedValue([mockOrder])

      const result = await service.getOrders('tenant-1', { limit: 10 })

      expect(mockOrderRepo.findMany).toHaveBeenCalledWith('tenant-1', { limit: 10 })
      expect(result).toEqual([mockOrder])
    })
  })

  describe('createOrder', () => {
    it('delegates to CreateOrderUseCase', async () => {
      const { service, mockCreateOrderUseCase } = makeSut()
      mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder)

      const orderData = {
        branchId: 'branch-1',
        tableId: 'table-1',
        type: 'dine_in',
        subtotal: 178,
        tax: 28.48,
        total: 206.48,
        items: [{ menuItemId: 'item-1', name: 'Pasta', quantity: 2, unitPrice: 89 }],
      }

      const result = await service.createOrder('tenant-1', orderData, 'user-1')

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

  describe('getOrder', () => {
    it('returns an order by ID', async () => {
      const { service, mockOrderRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(mockOrder)

      const result = await service.getOrder('tenant-1', 'order-1')

      expect(mockOrderRepo.findById).toHaveBeenCalledWith('tenant-1', 'order-1')
      expect(result).toEqual(mockOrder)
    })

    it('throws 404 when order not found', async () => {
      const { service, mockOrderRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(null)

      await expect(service.getOrder('tenant-1', 'bad-id'))
        .rejects.toMatchObject({ statusCode: 404, code: 'ORDER_NOT_FOUND' })
    })
  })

  describe('updateOrderStatus', () => {
    it('updates order status', async () => {
      const { service, mockOrderRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(mockOrder)
      mockOrderRepo.updateStatus.mockResolvedValue({ ...mockOrder, status: 'preparing' })

      const result = await service.updateOrderStatus('tenant-1', 'order-1', 'preparing' as any)

      expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('order-1', 'preparing')
    })

    it('throws 404 when order not found', async () => {
      const { service, mockOrderRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(null)

      await expect(service.updateOrderStatus('tenant-1', 'bad-id', 'preparing' as any))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('processPayment', () => {
    it('creates payment and marks order paid for cash/card', async () => {
      const { service, mockOrderRepo, mockPaymentRepo, mockTableRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(mockOrder)
      mockPaymentRepo.create.mockResolvedValue({ id: 'pay-1', status: 'completed' })

      const result = await service.processPayment('tenant-1', {
        orderId: 'order-1',
        method: 'cash' as any,
        amount: 206.20,
      })

      expect(mockPaymentRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        tenantId: 'tenant-1',
        orderId: 'order-1',
        method: 'cash',
        status: 'completed',
      }))
      expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('order-1', 'paid')
      expect(mockTableRepo.updateStatus).toHaveBeenCalledWith('tenant-1', 'table-1', 'available')
    })

    it('creates payment as pending for online payment methods (stripe)', async () => {
      const { service, mockOrderRepo, mockPaymentRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(mockOrder)
      mockPaymentRepo.create.mockResolvedValue({ id: 'pay-1', status: 'pending' })

      const result = await service.processPayment('tenant-1', {
        orderId: 'order-1',
        method: 'stripe' as any,
        amount: 206.20,
      })

      expect(mockPaymentRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        status: 'pending',
      }))
      // Should NOT update order status yet (pending online payment)
      expect(mockOrderRepo.updateStatus).not.toHaveBeenCalled()
    })

    it('throws 404 when order not found', async () => {
      const { service, mockOrderRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(null)

      await expect(service.processPayment('tenant-1', { orderId: 'bad-id', method: 'cash' as any, amount: 100 }))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('confirmPayment', () => {
    it('marks payment completed and order paid', async () => {
      const { service, mockOrderRepo, mockPaymentRepo, mockTableRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(mockOrder)
      mockPaymentRepo.updateByOrder.mockResolvedValue({ id: 'pay-1', status: 'completed' })

      await service.confirmPayment('tenant-1', { orderId: 'order-1', transactionId: 'txn-123' })

      expect(mockPaymentRepo.updateByOrder).toHaveBeenCalledWith('order-1', {
        status: 'completed',
        reference: 'txn-123',
      })
      expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('order-1', 'paid')
      expect(mockTableRepo.updateStatus).toHaveBeenCalledWith('tenant-1', 'table-1', 'available')
    })

    it('throws 404 when order not found', async () => {
      const { service, mockOrderRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(null)

      await expect(service.confirmPayment('tenant-1', { orderId: 'bad-id', transactionId: 'txn' }))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('splitBill', () => {
    it('creates multiple payments for split bill', async () => {
      const { service, mockOrderRepo, mockPaymentRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(mockOrder)
      mockPaymentRepo.createMany.mockResolvedValue([
        { id: 'pay-1', amount: 103.10, status: 'completed' },
        { id: 'pay-2', amount: 103.10, status: 'completed' },
      ])

      const result = await service.splitBill('tenant-1', {
        orderId: 'order-1',
        splits: [
          { items: ['oi-1'], amount: 103.10 },
          { items: ['oi-2'], amount: 103.10 },
        ],
      })

      expect(mockPaymentRepo.createMany).toHaveBeenCalledWith([
        expect.objectContaining({ tenantId: 'tenant-1', orderId: 'order-1', amount: 103.10, method: 'cash', status: 'completed' }),
        expect.objectContaining({ tenantId: 'tenant-1', orderId: 'order-1', amount: 103.10, method: 'cash', status: 'completed' }),
      ])
      expect(result).toHaveLength(2)
    })

    it('throws 404 when order not found', async () => {
      const { service, mockOrderRepo } = makeSut()
      mockOrderRepo.findById.mockResolvedValue(null)

      await expect(service.splitBill('tenant-1', { orderId: 'bad-id', splits: [] }))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })
})
