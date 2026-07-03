import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { AccountingService } from './accounting.service.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class AccountingController {
  private service = container.resolve(AccountingService)

  async getAccounts(req: Request, res: Response) {
    const accounts = await this.service.getAccounts(req.tenantId!)
    res.json({ success: true, data: accounts })
  }

  async getAccount(req: Request, res: Response) {
    const account = await this.service.getAccount(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: account })
  }

  async createAccount(req: Request, res: Response) {
    const account = await this.service.createAccount(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: account })
  }

  async updateAccount(req: Request, res: Response) {
    const account = await this.service.updateAccount(req.tenantId!, req.params.id as string, req.body)
    res.json({ success: true, data: account })
  }

  async deleteAccount(req: Request, res: Response) {
    await this.service.deleteAccount(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: null })
  }

  async importAccounts(req: Request, res: Response) {
    const result = await this.service.importAccounts(req.tenantId!, req.body)
    res.json({ success: true, data: result })
  }

  async getJournalEntries(req: Request, res: Response) {
    const result = await this.service.getJournalEntries(req.tenantId!, req.query as any)
    res.json({ success: true, data: result })
  }

  async getJournalEntry(req: Request, res: Response) {
    const entry = await this.service.getJournalEntry(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: entry })
  }

  async createJournalEntry(req: Request, res: Response) {
    const entry = await this.service.createJournalEntry(req.tenantId!, req.body, req.user!.sub)
    res.status(201).json({ success: true, data: entry })
  }

  async postJournalEntry(req: Request, res: Response) {
    const entry = await this.service.postJournalEntry(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: entry })
  }

  async deleteJournalEntry(req: Request, res: Response) {
    await this.service.deleteJournalEntry(req.tenantId!, req.params.id as string)
    res.json({ success: true, data: null })
  }

  async getTrialBalance(req: Request, res: Response) {
    const balance = await this.service.getTrialBalance(req.tenantId!, req.query as any)
    res.json({ success: true, data: balance })
  }

  async getBalanceSheet(req: Request, res: Response) {
    const sheet = await this.service.getBalanceSheet(req.tenantId!, req.query as any)
    res.json({ success: true, data: sheet })
  }

  async getIncomeStatement(req: Request, res: Response) {
    const statement = await this.service.getIncomeStatement(req.tenantId!, req.query as any)
    res.json({ success: true, data: statement })
  }

  async getGeneralLedger(req: Request, res: Response) {
    const ledger = await this.service.getGeneralLedger(req.tenantId!, req.query as any)
    res.json({ success: true, data: ledger })
  }

  async getPeriods(req: Request, res: Response) {
    const periods = await this.service.getPeriods(req.tenantId!)
    res.json({ success: true, data: periods })
  }

  async createPeriod(req: Request, res: Response) {
    const period = await this.service.createPeriod(req.tenantId!, req.body)
    res.status(201).json({ success: true, data: period })
  }

  async closePeriod(req: Request, res: Response) {
    const period = await this.service.closePeriod(req.tenantId!, req.body.periodId)
    res.json({ success: true, data: period })
  }

  async getODataFeed(req: Request, res: Response) {
    const feed = await this.service.getODataFeed(req.tenantId!, req.params.entity as string, req.query as any)
    res.json({ success: true, data: feed })
  }
}

export const accountingController = wrapAsync(new AccountingController())
export { AccountingController }
