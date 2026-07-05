import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InventoryService } from './inventory.service.js'
import { AppError } from '../../common/filters/error-handler.js'

function makeSut(createIngredientUseCase?: any) {
  const mockInventoryRepo = {
    findManyIngredients: vi.fn(),
    findIngredientByTenant: vi.fn(),
    createIngredient: vi.fn(),
    updateIngredient: vi.fn(),
    findManyRecipes: vi.fn(),
    createRecipe: vi.fn(),
    updateRecipe: vi.fn(),
    findRecipeByItem: vi.fn(),
    findStockAlerts: vi.fn(),
    findManyStockMovements: vi.fn(),
  }

  const service = new InventoryService(mockInventoryRepo as any, createIngredientUseCase)

  return { service, mockInventoryRepo }
}

const mockIngredient = {
  id: 'ing-1',
  tenantId: 'tenant-1',
  name: 'Beef Patty',
  unit: 'kg',
  unitCost: 5.50,
  stock: 20,
  minStock: 5,
}

const mockRecipe = {
  id: 'recipe-1',
  menuItemId: 'item-1',
  tenantId: 'tenant-1',
  name: 'Hamburger Recipe',
  ingredients: [
    { id: 'ri-1', ingredientId: 'ing-1', quantity: 0.2, ingredient: { unitCost: 5.50 } },
  ],
  totalCost: 1.10,
}

describe('InventoryService', () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe('getIngredients', () => {
    it('returns ingredients with pagination', async () => {
      const { service, mockInventoryRepo } = makeSut()
      mockInventoryRepo.findManyIngredients.mockResolvedValue([mockIngredient])

      const result = await service.getIngredients('tenant-1', { limit: 10, offset: 0 })

      expect(mockInventoryRepo.findManyIngredients).toHaveBeenCalledWith('tenant-1', { limit: 10, offset: 0 })
      expect(result).toEqual([mockIngredient])
    })

    it('calls without pagination when opts omitted', async () => {
      const { service, mockInventoryRepo } = makeSut()
      mockInventoryRepo.findManyIngredients.mockResolvedValue([])

      await service.getIngredients('tenant-1')

      expect(mockInventoryRepo.findManyIngredients).toHaveBeenCalledWith('tenant-1', undefined)
    })
  })

  describe('createIngredient', () => {
    it('delegates to use case when provided', async () => {
      const useCase = { execute: vi.fn().mockResolvedValue(mockIngredient) }
      const { service } = makeSut(useCase)

      const result = await service.createIngredient('tenant-1', { name: 'Beef Patty', unit: 'kg' })

      expect(useCase.execute).toHaveBeenCalledWith('tenant-1', { name: 'Beef Patty', unit: 'kg' })
      expect(result).toEqual(mockIngredient)
    })

    it('falls back to repository when no use case', async () => {
      const { service, mockInventoryRepo } = makeSut()
      mockInventoryRepo.createIngredient.mockResolvedValue(mockIngredient)

      const result = await service.createIngredient('tenant-1', { name: 'Beef Patty' })

      expect(mockInventoryRepo.createIngredient).toHaveBeenCalledWith('tenant-1', { name: 'Beef Patty' })
      expect(result).toEqual(mockIngredient)
    })
  })

  describe('updateIngredient', () => {
    it('updates existing ingredient', async () => {
      const { service, mockInventoryRepo } = makeSut()
      mockInventoryRepo.findIngredientByTenant.mockResolvedValue(mockIngredient)
      mockInventoryRepo.updateIngredient.mockResolvedValue({ ...mockIngredient, currentStock: 30 })

      const result = await service.updateIngredient('tenant-1', 'ing-1', { currentStock: 30 })

      expect(mockInventoryRepo.findIngredientByTenant).toHaveBeenCalledWith('tenant-1', 'ing-1')
      expect(mockInventoryRepo.updateIngredient).toHaveBeenCalledWith('ing-1', { currentStock: 30 })
      expect(result.currentStock).toBe(30)
    })

    it('throws 404 when ingredient not found', async () => {
      const { service, mockInventoryRepo } = makeSut()
      mockInventoryRepo.findIngredientByTenant.mockResolvedValue(null)

      await expect(service.updateIngredient('tenant-1', 'bad-id', { stock: 30 })).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('getRecipes', () => {
    it('returns recipes with pagination', async () => {
      const { service, mockInventoryRepo } = makeSut()
      mockInventoryRepo.findManyRecipes.mockResolvedValue([mockRecipe])

      const result = await service.getRecipes('tenant-1')

      expect(mockInventoryRepo.findManyRecipes).toHaveBeenCalledWith('tenant-1', undefined)
      expect(result).toHaveLength(1)
    })
  })

  describe('createRecipe', () => {
    it('delegates to repository', async () => {
      const { service, mockInventoryRepo } = makeSut()
      mockInventoryRepo.createRecipe.mockResolvedValue(mockRecipe)

      const result = await service.createRecipe('tenant-1', { menuItemId: 'item-1', ingredients: [] })

      expect(mockInventoryRepo.createRecipe).toHaveBeenCalledWith({ menuItemId: 'item-1', ingredients: [] })
      expect(result).toEqual(mockRecipe)
    })
  })

  describe('updateRecipe', () => {
    it('delegates to repository', async () => {
      const { service, mockInventoryRepo } = makeSut()
      mockInventoryRepo.updateRecipe.mockResolvedValue({ ...mockRecipe, name: 'Updated' })

      const result = await service.updateRecipe('tenant-1', 'recipe-1', { name: 'Updated' })

      expect(mockInventoryRepo.updateRecipe).toHaveBeenCalledWith('recipe-1', { name: 'Updated' })
      expect(result.name).toBe('Updated')
    })
  })

  describe('getRecipeByItem', () => {
    it('returns recipe with computed totalCost', async () => {
      const { service, mockInventoryRepo } = makeSut()
      mockInventoryRepo.findRecipeByItem.mockResolvedValue(mockRecipe)

      const result = await service.getRecipeByItem('item-1', 'tenant-1')

      expect(mockInventoryRepo.findRecipeByItem).toHaveBeenCalledWith('item-1', 'tenant-1')
      expect(result!.totalCost).toBeCloseTo(1.10)
    })

    it('returns null when no recipe found', async () => {
      const { service, mockInventoryRepo } = makeSut()
      mockInventoryRepo.findRecipeByItem.mockResolvedValue(null)

      const result = await service.getRecipeByItem('item-99', 'tenant-1')

      expect(result).toBeNull()
    })
  })

  describe('getStockAlerts', () => {
    it('returns stock alerts', async () => {
      const { service, mockInventoryRepo } = makeSut()
      const alerts = [{ id: 'ing-1', name: 'Beef Patty', stock: 1, minStock: 5 }]
      mockInventoryRepo.findStockAlerts.mockResolvedValue(alerts)

      const result = await service.getStockAlerts('tenant-1', { limit: 10 })

      expect(mockInventoryRepo.findStockAlerts).toHaveBeenCalledWith('tenant-1', { limit: 10 })
      expect(result).toEqual(alerts)
    })
  })

  describe('getStockMovements', () => {
    it('returns stock movements with pagination', async () => {
      const { service, mockInventoryRepo } = makeSut()
      const movements = [{ id: 'mov-1', ingredientId: 'ing-1', quantity: -2, type: 'usage' }]
      mockInventoryRepo.findManyStockMovements.mockResolvedValue(movements)

      const result = await service.getStockMovements('tenant-1')

      expect(mockInventoryRepo.findManyStockMovements).toHaveBeenCalledWith('tenant-1', undefined)
      expect(result).toEqual(movements)
    })
  })
})
