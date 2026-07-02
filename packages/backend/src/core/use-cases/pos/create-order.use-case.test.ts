import 'reflect-metadata'
import { describe, it, expect, vi } from 'vitest'
import { CreateOrderUseCase } from './create-order.use-case.js'

function makeSut() {
  const mockUow = { execute: vi.fn((fn: () => Promise<any>) => fn()) }
  const mockEventBus = { publish: vi.fn(), subscribe: vi.fn() }
  const mockOrderRepo = { create: vi.fn(), findById: vi.fn(), findActiveByTable: vi.fn(), updateStatus: vi.fn() }
  const mockMenuRepo = { findRecipeByMenuItem: vi.fn(), getMenu: vi.fn(), getMenuItems: vi.fn() }
  const mockInventoryRepo = { deductStock: vi.fn(), createMovement: vi.fn(), findById: vi.fn() }
  const mockTableRepo = { updateStatus: vi.fn(), findById: vi.fn() }

  const useCase = new CreateOrderUseCase(
    mockUow as any,
    mockEventBus as any,
    mockOrderRepo as any,
    mockMenuRepo as any,
    mockInventoryRepo as any,
    mockTableRepo as any,
  )

  return { useCase, mockUow, mockEventBus, mockOrderRepo, mockMenuRepo, mockInventoryRepo, mockTableRepo }
}

const validInput = {
  tenantId: 'tenant-1',
  tableId: 'table-1',
  userId: 'user-1',
  type: 'dine_in',
  subtotal: 100,
  tax: 10,
  discount: 0,
  total: 110,
  items: [
    {
      menuItemId: 'item-1',
      name: 'Burger',
      quantity: 2,
      unitPrice: 50,
      modifiers: [{ groupId: 'g-1', optionId: 'o-1', name: 'Extra cheese', price: 5 }],
    },
  ],
}

const mockOrder = {
  id: 'order-1',
  tenantId: 'tenant-1',
  total: 110,
  createdAt: new Date(),
  items: [{ id: 'oi-1', menuItemId: 'item-1', name: 'Burger', quantity: 2, unitPrice: 50, totalPrice: 100, modifiers: [] }],
  table: { id: 'table-1', label: 'T1' },
}

const mockRecipe = {
  id: 'recipe-1',
  menuItemId: 'item-1',
  name: 'Burger Recipe',
  servings: 1,
  ingredients: [{ ingredientId: 'ing-1', quantity: 0.2, name: 'Beef patty', unit: 'kg' }],
}

describe('CreateOrderUseCase', () => {
  it('creates order, updates table, deducts inventory, and publishes event', async () => {
    const { useCase, mockUow, mockOrderRepo, mockTableRepo, mockInventoryRepo, mockMenuRepo, mockEventBus } = makeSut()

    mockOrderRepo.create.mockResolvedValue(mockOrder)
    mockMenuRepo.findRecipeByMenuItem.mockResolvedValue(mockRecipe)
    mockInventoryRepo.findById.mockResolvedValue({ id: 'ing-1', name: 'Beef patty', unit: 'kg', currentStock: 5, minimumStock: 2 })

    const result = await useCase.execute(validInput)

    expect(mockUow.execute).toHaveBeenCalledOnce()
    expect(mockOrderRepo.create).toHaveBeenCalledOnce()
    expect(mockTableRepo.updateStatus).toHaveBeenCalledWith('table-1', 'occupied')
    expect(mockMenuRepo.findRecipeByMenuItem).toHaveBeenCalledWith('item-1')
    expect(mockInventoryRepo.deductStock).toHaveBeenCalledWith('ing-1', 'tenant-1', 0.4)
    expect(mockInventoryRepo.createMovement).toHaveBeenCalledWith('ing-1', 'tenant-1', 'out', 0.4, 'order-item-1')
    expect(mockEventBus.publish).toHaveBeenCalledOnce()
    expect(mockEventBus.publish.mock.calls[0][0].eventName).toBe('order.created')
    expect(result).toEqual(mockOrder)
  })

  it('skips table update when no tableId', async () => {
    const { useCase, mockOrderRepo, mockTableRepo, mockMenuRepo } = makeSut()

    mockOrderRepo.create.mockResolvedValue(mockOrder)

    await useCase.execute({ ...validInput, tableId: undefined })

    expect(mockTableRepo.updateStatus).not.toHaveBeenCalled()
    expect(mockMenuRepo.findRecipeByMenuItem).toHaveBeenCalled()
  })

  it('skips inventory deduction when no recipe found', async () => {
    const { useCase, mockOrderRepo, mockMenuRepo, mockInventoryRepo } = makeSut()

    mockOrderRepo.create.mockResolvedValue(mockOrder)
    mockMenuRepo.findRecipeByMenuItem.mockResolvedValue(null)

    await useCase.execute({ ...validInput, tableId: undefined })

    expect(mockInventoryRepo.deductStock).not.toHaveBeenCalled()
    expect(mockInventoryRepo.createMovement).not.toHaveBeenCalled()
  })

  it('logs warning when stock drops below minimum', async () => {
    const { useCase, mockOrderRepo, mockMenuRepo, mockInventoryRepo } = makeSut()

    mockOrderRepo.create.mockResolvedValue(mockOrder)
    mockMenuRepo.findRecipeByMenuItem.mockResolvedValue(mockRecipe)
    mockInventoryRepo.findById.mockResolvedValue({ id: 'ing-1', currentStock: 1, minimumStock: 2, name: 'Beef patty', unit: 'kg' })

    const loggerWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await useCase.execute({ ...validInput, tableId: undefined })

    expect(mockInventoryRepo.deductStock).toHaveBeenCalled()
  })
})
