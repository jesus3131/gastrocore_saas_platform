import { z } from 'zod'

export const createAccountSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
  subtype: z.string().max(100).optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
})

export const updateAccountSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']).optional(),
  subtype: z.string().max(100).optional(),
  parentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const createJournalEntrySchema = z.object({
  entryDate: z.string().or(z.date()),
  description: z.string().min(1),
  reference: z.string().max(100).optional(),
  entryType: z.enum(['manual', 'automatic']).default('manual'),
  status: z.enum(['draft', 'posted']).default('draft'),
  periodId: z.string().uuid().optional(),
  lines: z.array(z.object({
    accountId: z.string().uuid(),
    debit: z.coerce.number().min(0).default(0),
    credit: z.coerce.number().min(0).default(0),
    description: z.string().optional(),
  })).min(2, 'Debe tener al menos 2 líneas (partida doble)'),
}).refine((data) => {
  const totalDebit = data.lines.reduce((s, l) => s + l.debit, 0)
  const totalCredit = data.lines.reduce((s, l) => s + l.credit, 0)
  return Math.abs(totalDebit - totalCredit) < 0.01
}, { message: 'Debe y Haber deben sumar lo mismo (partida doble)' })

export const createPeriodSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
})

export const closePeriodSchema = z.object({
  periodId: z.string().uuid(),
})

export const importAccountsSchema = z.object({
  accounts: z.array(z.object({
    code: z.string().min(1).max(20),
    name: z.string().min(1).max(255),
    type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
    subtype: z.string().max(100).optional(),
    parentCode: z.string().optional(),
  })),
})
