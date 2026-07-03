import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { CreateEmployeeUseCase } from './create-employee.use-case.js'

const validInput = {
  tenantId: 'tenant-1',
  name: 'Juan Pérez',
  email: 'juan@cocina.com',
  role: 'chef',
  phone: '555-0101',
  pinCode: '1234',
  hourlyRate: 150,
}

const mockTenant = {
  id: 'tenant-1',
  subscriptionPlan: 'basic' as any,
  customFields: {},
}

function makeSut() {
  const mockEmployeeRepo = { create: vi.fn(), findById: vi.fn(), findMany: vi.fn(), update: vi.fn(), countActive: vi.fn() }
  const mockTenantRepo = { findById: vi.fn() }
  const useCase = new CreateEmployeeUseCase(mockEmployeeRepo as any, mockTenantRepo as any)
  return { useCase, mockEmployeeRepo, mockTenantRepo }
}

describe('CreateEmployeeUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates employee when under user limit', async () => {
    const { useCase, mockEmployeeRepo, mockTenantRepo } = makeSut()
    mockTenantRepo.findById.mockResolvedValue(mockTenant)
    mockEmployeeRepo.countActive.mockResolvedValue(2)
    mockEmployeeRepo.create.mockResolvedValue({ id: 'emp-1', ...validInput })

    const result = await useCase.execute(validInput)

    expect(mockTenantRepo.findById).toHaveBeenCalledWith('tenant-1')
    expect(mockEmployeeRepo.countActive).toHaveBeenCalledWith('tenant-1')
    expect(mockEmployeeRepo.create).toHaveBeenCalled()
    expect(result.id).toBe('emp-1')
  })

  it('rejects when user limit reached', async () => {
    const { useCase, mockEmployeeRepo, mockTenantRepo } = makeSut()
    mockTenantRepo.findById.mockResolvedValue(mockTenant)
    mockEmployeeRepo.countActive.mockResolvedValue(999)

    await expect(useCase.execute(validInput)).rejects.toMatchObject({ code: 'USER_LIMIT_REACHED' })
    expect(mockEmployeeRepo.create).not.toHaveBeenCalled()
  })
})
