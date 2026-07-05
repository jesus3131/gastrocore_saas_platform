import { inject, injectable } from 'tsyringe'
import { AppError } from '../../common/filters/error-handler.js'
import { CreateJournalEntryUseCase } from '../../core/use-cases/accounting/create-journal-entry.use-case.js'
import { withCache } from '../../common/cache/cache.js'
import type { AccountRepository } from '../../core/ports/repositories/account.repository.js'
import type { JournalRepository } from '../../core/ports/repositories/journal.repository.js'
import type { AccountingPeriodRepository } from '../../core/ports/repositories/accounting-period.repository.js'

@injectable()
export class AccountingService {
  constructor(
    @inject('AccountRepository') private readonly accountRepo: AccountRepository,
    @inject('JournalRepository') private readonly journalRepo: JournalRepository,
    @inject('AccountingPeriodRepository') private readonly periodRepo: AccountingPeriodRepository,
    private readonly createJournalEntryUseCase?: CreateJournalEntryUseCase,
  ) {}

  // ─── Chart of Accounts ──────────────────────────────────────

  async getAccounts(tenantId: string) {
    const accounts = await this.accountRepo.findMany(tenantId, {
      options: { include: { children: true }, orderBy: { code: 'asc' } },
    })
    return this.buildTree(accounts)
  }

  async getAccount(tenantId: string, id: string) {
    const account = await this.accountRepo.findFirst(
      { tenantId, id },
      { parent: true, children: { orderBy: { code: 'asc' } } },
    )
    if (!account) throw new AppError(404, 'ACCOUNT_NOT_FOUND', 'Account not found')
    return account
  }

  async createAccount(tenantId: string, data: any) {
    if (data.parentId) {
      const parent = await this.accountRepo.findFirst({ where: { tenantId, id: data.parentId } })
      if (!parent) throw new AppError(404, 'PARENT_NOT_FOUND', 'Parent account not found')
    }
    return this.accountRepo.create({ ...data, tenantId })
  }

  async updateAccount(tenantId: string, id: string, data: any) {
    const account = await this.accountRepo.findFirst({ where: { tenantId, id } })
    if (!account) throw new AppError(404, 'ACCOUNT_NOT_FOUND', 'Account not found')
    if (account.isSystem) throw new AppError(403, 'SYSTEM_ACCOUNT', 'Cannot modify system accounts')
    return this.accountRepo.update(id, data)
  }

  async deleteAccount(tenantId: string, id: string) {
    const account = await this.accountRepo.findFirst({ where: { tenantId, id } })
    if (!account) throw new AppError(404, 'ACCOUNT_NOT_FOUND', 'Account not found')
    if (account.isSystem) throw new AppError(403, 'SYSTEM_ACCOUNT', 'Cannot delete system accounts')
    const lines = await this.journalRepo.countLines({ accountId: id })
    if (lines > 0) throw new AppError(400, 'ACCOUNT_HAS_TRANSACTIONS', 'Account has journal entries, deactivate instead')
    return this.accountRepo.delete(id)
  }

  async importAccounts(tenantId: string, data: { accounts: any[] }) {
    const parentCodes = data.accounts.map((a: any) => a.parentCode).filter(Boolean)
    const parentAccounts = parentCodes.length > 0
      ? await this.accountRepo.findMany(tenantId, { where: { code: { in: [...new Set(parentCodes)] } }, options: { select: { id: true, code: true } } })
      : []
    const parentMap = new Map(parentAccounts.map((p: any) => [p.code, p.id]))

    const existingAccounts = await this.accountRepo.findMany(tenantId, { options: { select: { code: true } } })
    const existingCodes = new Set(existingAccounts.map((a: any) => a.code))

    const newAccounts = data.accounts
      .filter((a: any) => !existingCodes.has(a.code))
      .map((a: any) => ({ tenantId, code: a.code, name: a.name, type: a.type, subtype: a.subtype, parentId: parentMap.get(a.parentCode) || undefined }))

    if (newAccounts.length === 0) return []
    await this.accountRepo.createMany(newAccounts)
    return this.accountRepo.findMany(tenantId, { where: { code: { in: newAccounts.map((a: any) => a.code) } }, options: {} })
  }

  // ─── Journal Entries ────────────────────────────────────────

  async getJournalEntries(tenantId: string, query: { periodId?: string; status?: string; from?: string; to?: string; limit?: number; offset?: number }) {
    const where: any = {}
    if (query.periodId) where.periodId = query.periodId
    if (query.status) where.status = query.status
    if (query.from || query.to) {
      where.entryDate = {}
      if (query.from) where.entryDate.gte = new Date(query.from)
      if (query.to) where.entryDate.lte = new Date(query.to)
    }
    return this.journalRepo.findMany(tenantId, {
      where,
      options: {
        include: { lines: { include: { account: true } }, period: { select: { id: true, name: true } } },
        orderBy: { entryDate: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      },
    })
  }

  async getJournalEntry(tenantId: string, id: string) {
    const entry = await this.journalRepo.findFirst(
      { tenantId, id },
      { lines: { include: { account: true } }, period: { select: { id: true, name: true } } },
    )
    if (!entry) throw new AppError(404, 'ENTRY_NOT_FOUND', 'Journal entry not found')
    return entry
  }

  async createJournalEntry(tenantId: string, data: any, userId?: string) {
    if (this.createJournalEntryUseCase) {
      return this.createJournalEntryUseCase.execute(tenantId, data, userId)
    }

    if (data.periodId) {
      const period = await this.periodRepo.findFirst({ where: { tenantId, id: data.periodId } })
      if (!period) throw new AppError(404, 'PERIOD_NOT_FOUND', 'Period not found')
      if (period.isClosed) throw new AppError(400, 'PERIOD_CLOSED', 'Cannot add entries to closed period')
    }

    for (const line of data.lines) {
      const account = await this.accountRepo.findFirst({ where: { tenantId, id: line.accountId } })
      if (!account) throw new AppError(404, 'ACCOUNT_NOT_FOUND', `Account ${line.accountId} not found`)
      if (!account.isActive) throw new AppError(400, 'ACCOUNT_INACTIVE', `Account ${account.name} is inactive`)
    }

    return this.journalRepo.create({
      tenantId,
      entryDate: new Date(data.entryDate),
      description: data.description,
      reference: data.reference,
      entryType: data.entryType || 'manual',
      status: data.status || 'draft',
      createdBy: userId,
      periodId: data.periodId,
      lines: {
        create: data.lines.map((l: any) => ({
          accountId: l.accountId,
          debit: l.debit,
          credit: l.credit,
          description: l.description,
        })),
      },
      include: { lines: { include: { account: true } }, period: { select: { id: true, name: true } } },
    })
  }

  async postJournalEntry(tenantId: string, id: string) {
    const entry = await this.journalRepo.findFirst({ where: { tenantId, id } })
    if (!entry) throw new AppError(404, 'ENTRY_NOT_FOUND', 'Journal entry not found')
    if (entry.status === 'posted') throw new AppError(400, 'ALREADY_POSTED', 'Entry already posted')

    if (entry.periodId) {
      const period = await this.periodRepo.findFirst({ where: { tenantId, id: entry.periodId } })
      if (period?.isClosed) throw new AppError(400, 'PERIOD_CLOSED', 'Cannot post to closed period')
    }

    return this.journalRepo.update(id, {
      status: 'posted',
      include: { lines: { include: { account: true } } },
    })
  }

  async deleteJournalEntry(tenantId: string, id: string) {
    const entry = await this.journalRepo.findFirst({ where: { tenantId, id } })
    if (!entry) throw new AppError(404, 'ENTRY_NOT_FOUND', 'Journal entry not found')
    if (entry.status === 'posted') throw new AppError(400, 'ALREADY_POSTED', 'Cannot delete posted entry')
    return this.journalRepo.delete(id)
  }

  // ─── Automated Entries from POS Transactions ───────────────

  async createAutoEntryFromOrder(tenantId: string, order: any) {
    const findOrCreateAccount = async (code: string, defaults: any) => {
      let account = await this.accountRepo.findFirst({ where: { tenantId, code } })
      if (!account) {
        account = await this.accountRepo.create({ tenantId, ...defaults, isSystem: true })
      }
      return account
    }

    const cashAccount = await findOrCreateAccount('1101', { code: '1101', name: 'Caja y Bancos', type: 'asset', subtype: 'current_asset' })
    const revenueAccount = await findOrCreateAccount('4101', { code: '4101', name: 'Ingresos por Ventas', type: 'income', subtype: 'operating_revenue' })
    const taxAccount = await findOrCreateAccount('2101', { code: '2101', name: 'IVA por Pagar', type: 'liability', subtype: 'current_liability' })

    const total = Number(order.total)
    const tax = Number(order.tax) || 0
    const subtotal = total - tax

    const period = await this.getOrCreatePeriod(tenantId, order.createdAt)

    return this.journalRepo.create({
      tenantId,
      entryDate: new Date(order.createdAt),
      description: `Venta POS - Orden #${order.id?.slice(0, 8)}`,
      reference: `POS-${order.id?.slice(0, 8)}`,
      entryType: 'automatic',
      status: 'posted',
      periodId: period.id,
      lines: {
        create: [
          { accountId: cashAccount.id, debit: total, credit: 0, description: 'Ingreso por venta' },
          { accountId: revenueAccount.id, debit: 0, credit: subtotal, description: 'Venta de productos' },
          { accountId: taxAccount.id, debit: 0, credit: tax, description: 'IVA generado' },
        ],
      },
    })
  }

  // ─── Financial Statements ───────────────────────────────────

  async getTrialBalance(tenantId: string, query: { periodId?: string; from?: string; to?: string }) {
    const cacheKey = `trial-balance:${tenantId}:${query.from || ''}:${query.to || ''}`
    return withCache(cacheKey, () => this._getTrialBalance(tenantId, query), 60_000)
  }

  private async _getTrialBalance(tenantId: string, query: { periodId?: string; from?: string; to?: string }) {
    const dateFilter: any = {}
    if (query.from || query.to) {
      if (query.from) dateFilter.gte = new Date(query.from)
      if (query.to) dateFilter.lte = new Date(query.to)
    }

    const entriesWhere: any = { status: 'posted' }
    if (Object.keys(dateFilter).length) entriesWhere.entryDate = dateFilter

    const lines = await this.journalRepo.findManyLines(
      { entry: { ...entriesWhere, tenantId }, account: { tenantId } },
      { include: { account: true } },
    )

    const totals: Record<string, { account: any; totalDebit: number; totalCredit: number }> = {}
    for (const line of lines) {
      if (!totals[line.accountId]) {
        totals[line.accountId] = { account: line.account, totalDebit: 0, totalCredit: 0 }
      }
      totals[line.accountId].totalDebit += Number(line.debit)
      totals[line.accountId].totalCredit += Number(line.credit)
    }

    return Object.values(totals).sort((a: any, b: any) => a.account.code.localeCompare(b.account.code))
  }

  async getBalanceSheet(tenantId: string, query: { periodId?: string; asOf?: string }) {
    const cacheKey = `balance-sheet:${tenantId}:${query.asOf || ''}`
    return withCache(cacheKey, () => this._getBalanceSheet(tenantId, query), 60_000)
  }

  private async _getBalanceSheet(tenantId: string, query: { periodId?: string; asOf?: string }) {
    const asOf = query.asOf ? new Date(query.asOf) : new Date()
    const entriesWhere: any = { status: 'posted', entryDate: { lte: asOf } }

    const lines = await this.journalRepo.findManyLines(
      { entry: { ...entriesWhere, tenantId }, account: { tenantId, type: { in: ['asset', 'liability', 'equity'] } } },
      { include: { account: true } },
    )

    type Section = { total: number; accounts: { code: string; name: string; balance: number }[] }
    const sections: Record<string, Section> = {
      asset: { total: 0, accounts: [] },
      liability: { total: 0, accounts: [] },
      equity: { total: 0, accounts: [] },
    }

    const balances: Record<string, { account: any; balance: number }> = {}
    for (const line of lines) {
      const key = line.accountId
      if (!balances[key]) balances[key] = { account: line.account, balance: 0 }
      if (line.account?.type === 'asset') {
        balances[key].balance += Number(line.debit) - Number(line.credit)
      } else {
        balances[key].balance += Number(line.credit) - Number(line.debit)
      }
    }

    for (const { account, balance } of Object.values(balances)) {
      const type = account.type as string
      if (sections[type]) {
        sections[type].accounts.push({ code: account.code, name: account.name, balance })
        sections[type].total += balance
      }
    }

    return {
      asOf: asOf.toISOString(),
      asset: { total: sections.asset.total, accounts: sections.asset.accounts },
      liability: { total: sections.liability.total, accounts: sections.liability.accounts },
      equity: { total: sections.equity.total, accounts: sections.equity.accounts },
      accountingEquation: {
        assets: sections.asset.total,
        liabilitiesPlusEquity: sections.liability.total + sections.equity.total,
        balanced: Math.abs(sections.asset.total - (sections.liability.total + sections.equity.total)) < 0.01,
      },
    }
  }

  async getIncomeStatement(tenantId: string, query: { periodId?: string; from?: string; to?: string }) {
    const cacheKey = `income-statement:${tenantId}:${query.from || ''}:${query.to || ''}`
    return withCache(cacheKey, () => this._getIncomeStatement(tenantId, query), 60_000)
  }

  private async _getIncomeStatement(tenantId: string, query: { periodId?: string; from?: string; to?: string }) {
    const dateFilter: any = {}
    if (query.from || query.to) {
      if (query.from) dateFilter.gte = new Date(query.from)
      if (query.to) dateFilter.lte = new Date(query.to)
    }

    const entriesWhere: any = { status: 'posted' }
    if (Object.keys(dateFilter).length) entriesWhere.entryDate = dateFilter

    const lines = await this.journalRepo.findManyLines(
      { entry: { ...entriesWhere, tenantId }, account: { tenantId, type: { in: ['income', 'expense'] } } },
      { include: { account: true } },
    )

    let totalIncome = 0
    let totalExpense = 0
    const incomes: { code: string; name: string; amount: number }[] = []
    const expenses: { code: string; name: string; amount: number }[] = []

    const balances: Record<string, { account: any; balance: number }> = {}
    for (const line of lines) {
      const key = line.accountId
      if (!balances[key]) balances[key] = { account: line.account, balance: 0 }
      if (line.account?.type === 'income') {
        balances[key].balance += Number(line.credit) - Number(line.debit)
      } else {
        balances[key].balance += Number(line.debit) - Number(line.credit)
      }
    }

    for (const { account, balance } of Object.values(balances)) {
      if (account.type === 'income') {
        incomes.push({ code: account.code, name: account.name, amount: balance })
        totalIncome += balance
      } else {
        expenses.push({ code: account.code, name: account.name, amount: balance })
        totalExpense += balance
      }
    }

    return { period: query, incomes, expenses, totalIncome, totalExpense, netIncome: totalIncome - totalExpense }
  }

  async getGeneralLedger(tenantId: string, query: { accountId?: string; from?: string; to?: string; limit?: number; offset?: number }) {
    const where: any = { entry: { tenantId } }
    if (query.accountId) where.accountId = query.accountId
    if (query.from || query.to) {
      where.entry = { tenantId }
      if (query.from || query.to) {
        where.entry.entryDate = {}
        if (query.from) where.entry.entryDate.gte = new Date(query.from)
        if (query.to) where.entry.entryDate.lte = new Date(query.to)
      }
    }

    const [lines, total] = await Promise.all([
      this.journalRepo.findManyLines(where, {
        include: { account: true, entry: { select: { id: true, entryDate: true, description: true, reference: true } } },
        orderBy: [{ entry: { entryDate: 'asc' } }, { id: 'asc' }],
        take: query.limit || 100,
        skip: query.offset || 0,
      }),
      this.journalRepo.countLines(where),
    ])

    return { lines, total }
  }

  // ─── Accounting Periods ─────────────────────────────────────

  async getPeriods(tenantId: string) {
    return this.periodRepo.findMany(tenantId)
  }

  async createPeriod(tenantId: string, data: any) {
    return this.periodRepo.create({ tenantId, name: data.name, startDate: new Date(data.startDate), endDate: new Date(data.endDate) })
  }

  async closePeriod(tenantId: string, periodId: string) {
    const period = await this.periodRepo.findFirst({ where: { tenantId, id: periodId } })
    if (!period) throw new AppError(404, 'PERIOD_NOT_FOUND', 'Period not found')
    if (period.isClosed) throw new AppError(400, 'ALREADY_CLOSED', 'Period already closed')

    const draftEntries = await this.journalRepo.count({ where: { tenantId, periodId, status: 'draft' } })
    if (draftEntries > 0) throw new AppError(400, 'DRAFT_ENTRIES', `Cannot close period: ${draftEntries} draft entries`)

    return this.periodRepo.update(periodId, { isClosed: true, closedAt: new Date() })
  }

  // ─── OData / Export ─────────────────────────────────────────

  async getODataFeed(tenantId: string, entity: string, query: any) {
    const baseUrl = `https://api.restopro.com/api/v1/accounting/odata/${entity}`
    const top = Math.min(Number(query.$top) || 100, 1000)
    const skip = Number(query.$skip) || 0

    let data: any[] = []
    if (entity === 'accounts') {
      data = await this.accountRepo.findMany(tenantId, { options: { take: top, skip } })
    } else if (entity === 'journalEntries') {
      const result = await this.journalRepo.findMany(tenantId, {
        options: { include: { lines: true }, take: top, skip, orderBy: { entryDate: 'desc' } },
      })
      data = result.entries
    } else if (entity === 'trialBalance') {
      data = await this.getTrialBalance(tenantId, query)
    }

    return { '@odata.context': `${baseUrl}/$metadata#${entity}`, value: data, '@odata.nextLink': data.length === top ? `${baseUrl}?$skip=${skip + top}&$top=${top}` : null }
  }

  // ─── Helpers ────────────────────────────────────────────────

  private async getOrCreatePeriod(tenantId: string, date: Date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    const periodName = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

    let period = await this.periodRepo.findFirst({ where: { tenantId, name: periodName } })
    if (!period) {
      period = await this.periodRepo.create({ tenantId, name: periodName, startDate: startOfMonth, endDate: endOfMonth })
    }
    return period
  }

  private buildTree(accounts: any[]) {
    const map = new Map<string, any>()
    const roots: any[] = []

    for (const acc of accounts) {
      map.set(acc.id, { ...acc, children: [] })
    }
    for (const acc of map.values()) {
      if (acc.parentId && map.has(acc.parentId)) {
        map.get(acc.parentId)!.children.push(acc)
      } else {
        roots.push(acc)
      }
    }
    return roots
  }
}
