import type { RefreshTokenEntity } from '../../../core/domain/entities/index.js'

export interface RefreshTokenRepository {
  create(userId: string, tokenHash: string, family: string, expiresAt: Date): Promise<void>
  findValid(tokenHash: string): Promise<RefreshTokenEntity | null>
  revoke(id: string): Promise<void>
  revokeAllByUser(userId: string): Promise<void>
}
