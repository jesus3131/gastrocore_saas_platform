import type { Request, Response, NextFunction } from 'express'
import { AccountingService } from './accounting.service.js'

export class AccountingController {
  private service = new AccountingService()

  async getAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      const accounts = await this.service.getAccounts(req.tenantId!)
      res.json({ success: true, data: accounts })
    } catch (err) { next(err) }
  }

  async getAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await this.service.getAccount(req.tenantId!, req.params.id as string)
      res.json({ success: true, data: account })
    } catch (err) { next(err) }
  }

  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await this.service.createAccount(req.tenantId!, req.body)
      res.status(201).json({ success: true, data: account })
    } catch (err) { next(err) }
  }

  async updateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await this.service.updateAccount(req.tenantId!, req.params.id as string, req.body)
      res.json({ success: true, data: account })
    } catch (err) { next(err) }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.deleteAccount(req.tenantId!, req.params.id as string)
      res.json({ success: true })
    } catch (err) { next(err) }
  }

  async importAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.importAccounts(req.tenantId!, req.body)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async getJournalEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.getJournalEntries(req.tenantId!, req.query as any)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async getJournalEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await this.service.getJournalEntry(req.tenantId!, req.params.id as string)
      res.json({ success: true, data: entry })
    } catch (err) { next(err) }
  }

  async createJournalEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await this.service.createJournalEntry(req.tenantId!, req.body, req.user!.sub)
      res.status(201).json({ success: true, data: entry })
    } catch (err) { next(err) }
  }

  async postJournalEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await this.service.postJournalEntry(req.tenantId!, req.params.id as string)
      res.json({ success: true, data: entry })
    } catch (err) { next(err) }
  }

  async deleteJournalEntry(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.deleteJournalEntry(req.tenantId!, req.params.id as string)
      res.json({ success: true })
    } catch (err) { next(err) }
  }

  async getTrialBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const balance = await this.service.getTrialBalance(req.tenantId!, req.query as any)
      res.json({ success: true, data: balance })
    } catch (err) { next(err) }
  }

  async getBalanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const sheet = await this.service.getBalanceSheet(req.tenantId!, req.query as any)
      res.json({ success: true, data: sheet })
    } catch (err) { next(err) }
  }

  async getIncomeStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const statement = await this.service.getIncomeStatement(req.tenantId!, req.query as any)
      res.json({ success: true, data: statement })
    } catch (err) { next(err) }
  }

  async getGeneralLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const ledger = await this.service.getGeneralLedger(req.tenantId!, req.query as any)
      res.json({ success: true, data: ledger })
    } catch (err) { next(err) }
  }

  async getPeriods(req: Request, res: Response, next: NextFunction) {
    try {
      const periods = await this.service.getPeriods(req.tenantId!)
      res.json({ success: true, data: periods })
    } catch (err) { next(err) }
  }

  async createPeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const period = await this.service.createPeriod(req.tenantId!, req.body)
      res.status(201).json({ success: true, data: period })
    } catch (err) { next(err) }
  }

  async closePeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const period = await this.service.closePeriod(req.tenantId!, req.body.periodId)
      res.json({ success: true, data: period })
    } catch (err) { next(err) }
  }

  async getODataFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const feed = await this.service.getODataFeed(req.tenantId!, req.params.entity as string, req.query as any)
      res.json(feed)
    } catch (err) { next(err) }
  }
}
