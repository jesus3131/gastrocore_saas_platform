import { Router } from 'express'
import { accountingController } from './accounting.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import {
  createAccountSchema, updateAccountSchema,
  createJournalEntrySchema, createPeriodSchema, closePeriodSchema,
  importAccountsSchema,
} from './accounting.validation.js'

const router = Router()

router.use(authGuard)

router.get('/accounts', requirePermission('accounting:read'), accountingController.getAccounts)
router.get('/accounts/:id', requirePermission('accounting:read'), accountingController.getAccount)
router.post('/accounts', requirePermission('accounting:write'), requireFullAuth, validate(createAccountSchema), accountingController.createAccount)
router.put('/accounts/:id', requirePermission('accounting:write'), requireFullAuth, validate(updateAccountSchema), accountingController.updateAccount)
router.delete('/accounts/:id', requirePermission('accounting:write'), requireFullAuth, accountingController.deleteAccount)
router.post('/accounts/import', requirePermission('accounting:write'), requireFullAuth, validate(importAccountsSchema), accountingController.importAccounts)

router.get('/journal-entries', requirePermission('accounting:read'), accountingController.getJournalEntries)
router.get('/journal-entries/:id', requirePermission('accounting:read'), accountingController.getJournalEntry)
router.post('/journal-entries', requirePermission('accounting:write'), requireFullAuth, validate(createJournalEntrySchema), accountingController.createJournalEntry)
router.post('/journal-entries/:id/post', requirePermission('accounting:write'), requireFullAuth, accountingController.postJournalEntry)
router.delete('/journal-entries/:id', requirePermission('accounting:write'), requireFullAuth, accountingController.deleteJournalEntry)

router.get('/trial-balance', requirePermission('accounting:read'), accountingController.getTrialBalance)
router.get('/balance-sheet', requirePermission('accounting:read'), accountingController.getBalanceSheet)
router.get('/income-statement', requirePermission('accounting:read'), accountingController.getIncomeStatement)
router.get('/general-ledger', requirePermission('accounting:read'), accountingController.getGeneralLedger)

router.get('/periods', requirePermission('accounting:read'), accountingController.getPeriods)
router.post('/periods', requirePermission('accounting:write'), requireFullAuth, validate(createPeriodSchema), accountingController.createPeriod)
router.post('/periods/close', requirePermission('accounting:write'), requireFullAuth, validate(closePeriodSchema), accountingController.closePeriod)

router.get('/odata/:entity', requirePermission('accounting:read'), accountingController.getODataFeed)

export { router as accountingRouter }
