import { AsyncLocalStorage } from 'async_hooks'
import { prisma, createScopedTransactionClient } from '../../config/database/prisma.js'
import type { Prisma } from '@prisma/client'
import type { UnitOfWork } from '../../core/ports/unit-of-work.js'

export class PrismaUnitOfWork implements UnitOfWork {
  private static txStorage = new AsyncLocalStorage<Prisma.TransactionClient>()

  async execute<T>(work: () => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      return PrismaUnitOfWork.txStorage.run(tx, () => work())
    }) as Promise<T>
  }

  static getTransaction(): any {
    const tx = PrismaUnitOfWork.txStorage.getStore()
    if (!tx) return null
    return createScopedTransactionClient(tx as any) || tx
  }
}
