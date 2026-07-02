import { Router } from 'express'
import { AccountingController } from './accounting.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import {
  createAccountSchema, updateAccountSchema,
  createJournalEntrySchema, createPeriodSchema, closePeriodSchema,
  importAccountsSchema,
} from './accounting.validation.js'

const router = Router()
const controller = new AccountingController()

router.use(authGuard)

// Chart of Accounts
router.get('/accounts', requirePermission('accounting:read'), controller.getAccounts.bind(controller))
router.get('/accounts/:id', requirePermission('accounting:read'), controller.getAccount.bind(controller))
router.post('/accounts', requirePermission('accounting:write'), requireFullAuth, validate(createAccountSchema), controller.createAccount.bind(controller))
router.put('/accounts/:id', requirePermission('accounting:write'), requireFullAuth, validate(updateAccountSchema), controller.updateAccount.bind(controller))
router.delete('/accounts/:id', requirePermission('accounting:write'), requireFullAuth, controller.deleteAccount.bind(controller))
router.post('/accounts/import', requirePermission('accounting:write'), requireFullAuth, validate(importAccountsSchema), controller.importAccounts.bind(controller))

// Journal Entries
router.get('/journal-entries', requirePermission('accounting:read'), controller.getJournalEntries.bind(controller))
router.get('/journal-entries/:id', requirePermission('accounting:read'), controller.getJournalEntry.bind(controller))
router.post('/journal-entries', requirePermission('accounting:write'), requireFullAuth, validate(createJournalEntrySchema), controller.createJournalEntry.bind(controller))
router.post('/journal-entries/:id/post', requirePermission('accounting:write'), requireFullAuth, controller.postJournalEntry.bind(controller))
router.delete('/journal-entries/:id', requirePermission('accounting:write'), requireFullAuth, controller.deleteJournalEntry.bind(controller))

// Financial Statements
router.get('/trial-balance', requirePermission('accounting:read'), controller.getTrialBalance.bind(controller))
router.get('/balance-sheet', requirePermission('accounting:read'), controller.getBalanceSheet.bind(controller))
router.get('/income-statement', requirePermission('accounting:read'), controller.getIncomeStatement.bind(controller))
router.get('/general-ledger', requirePermission('accounting:read'), controller.getGeneralLedger.bind(controller))

// Accounting Periods
router.get('/periods', requirePermission('accounting:read'), controller.getPeriods.bind(controller))
router.post('/periods', requirePermission('accounting:write'), requireFullAuth, validate(createPeriodSchema), controller.createPeriod.bind(controller))
router.post('/periods/close', requirePermission('accounting:write'), requireFullAuth, validate(closePeriodSchema), controller.closePeriod.bind(controller))

// OData Feed for Power BI
router.get('/odata/:entity', requirePermission('accounting:read'), controller.getODataFeed.bind(controller))

export { router as accountingRouter }
