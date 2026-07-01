import { z } from 'zod'

export const createEmployeeSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'chef', 'waiter', 'cashier', 'host', 'delivery', 'accountant']),
  pin: z.string().length(4).regex(/^\d{4}$/).optional(),
  branchId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
})

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'chef', 'waiter', 'cashier', 'host', 'delivery', 'accountant']).optional(),
  pin: z.string().length(4).regex(/^\d{4}$/).optional(),
  branchId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
})

export const createShiftSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().or(z.date()),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()).nullable().optional(),
  notes: z.string().optional(),
})

export const updateShiftStatusSchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'absent', 'cancelled']),
})

export const verifyPinSchema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/),
  role: z.enum(['waiter', 'chef', 'cashier', 'host', 'delivery']).optional(),
})
