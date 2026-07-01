import { Router } from 'express'
import { AccountingController } from './accounting.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
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
router.get('/accounts', controller.getAccounts.bind(controller))
router.get('/accounts/:id', controller.getAccount.bind(controller))
router.post('/accounts', validate(createAccountSchema), controller.createAccount.bind(controller))
router.put('/accounts/:id', validate(updateAccountSchema), controller.updateAccount.bind(controller))
router.delete('/accounts/:id', controller.deleteAccount.bind(controller))
router.post('/accounts/import', validate(importAccountsSchema), controller.importAccounts.bind(controller))

// Journal Entries
router.get('/journal-entries', controller.getJournalEntries.bind(controller))
router.get('/journal-entries/:id', controller.getJournalEntry.bind(controller))
router.post('/journal-entries', validate(createJournalEntrySchema), controller.createJournalEntry.bind(controller))
router.post('/journal-entries/:id/post', controller.postJournalEntry.bind(controller))
router.delete('/journal-entries/:id', controller.deleteJournalEntry.bind(controller))

// Financial Statements
router.get('/trial-balance', controller.getTrialBalance.bind(controller))
router.get('/balance-sheet', controller.getBalanceSheet.bind(controller))
router.get('/income-statement', controller.getIncomeStatement.bind(controller))
router.get('/general-ledger', controller.getGeneralLedger.bind(controller))

// Accounting Periods
router.get('/periods', controller.getPeriods.bind(controller))
router.post('/periods', validate(createPeriodSchema), controller.createPeriod.bind(controller))
router.post('/periods/close', validate(closePeriodSchema), controller.closePeriod.bind(controller))

// OData Feed for Power BI
router.get('/odata/:entity', controller.getODataFeed.bind(controller))

export { router as accountingRouter }
