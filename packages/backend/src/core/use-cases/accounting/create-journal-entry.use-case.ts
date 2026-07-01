import { injectable, inject } from 'tsyringe'
import type { AccountRepository } from '../../ports/repositories/account.repository.js'
import type { AccountingPeriodRepository } from '../../ports/repositories/accounting-period.repository.js'
import type { JournalRepository } from '../../ports/repositories/journal.repository.js'

@injectable()
export class CreateJournalEntryUseCase {
  constructor(
    @inject('AccountRepository') private readonly accountRepo: AccountRepository,
    @inject('AccountingPeriodRepository') private readonly periodRepo: AccountingPeriodRepository,
    @inject('JournalRepository') private readonly journalRepo: JournalRepository,
  ) {}

  async execute(tenantId: string, data: any, userId?: string) {
    const { AppError } = await import('../../../common/filters/error-handler.js')

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
      data: {
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
      },
      include: {
        lines: { include: { account: true } },
        period: { select: { id: true, name: true } },
      },
    })
  }
}
