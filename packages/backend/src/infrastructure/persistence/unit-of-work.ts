import { prisma } from '../../config/database/prisma.js'
import type { Prisma } from '@prisma/client'
import type { UnitOfWork } from '../../core/ports/unit-of-work.js'

export class PrismaUnitOfWork implements UnitOfWork {
  private static currentTx: Prisma.TransactionClient | null = null

  async execute<T>(work: () => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      PrismaUnitOfWork.currentTx = tx
      try {
        return await work()
      } finally {
        PrismaUnitOfWork.currentTx = null
      }
    }) as Promise<T>
  }

  static getTransaction(): Prisma.TransactionClient | null {
    return PrismaUnitOfWork.currentTx
  }
}
