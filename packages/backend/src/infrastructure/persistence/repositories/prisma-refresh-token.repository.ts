import { prisma } from '../../../config/database/prisma.js'
import { PrismaUnitOfWork } from '../unit-of-work.js'
import type { RefreshTokenRepository } from '../../../core/ports/repositories/refresh-token.repository.js'

function getClient(): any {
  return PrismaUnitOfWork.getTransaction() || prisma
}

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async create(userId: string, tenantId: string | null, tokenHash: string, family: string, expiresAt: Date): Promise<void> {
    await getClient().refreshToken.create({
      data: { userId, tenantId, tokenHash, family, expiresAt },
    })
  }

  async findValid(tokenHash: string): Promise<any | null> {
    return getClient().refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    })
  }

  async revoke(id: string): Promise<void> {
    await getClient().refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    })
  }

  async revokeAllByUser(userId: string): Promise<void> {
    await getClient().refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }
}
