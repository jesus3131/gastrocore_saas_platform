export class TenantId {
  private constructor(private readonly value: string) {
    if (!value || typeof value !== 'string' || value.length === 0) {
      throw new Error('TenantId must be a non-empty string')
    }
  }

  static fromString(value: string): TenantId {
    return new TenantId(value)
  }

  toString(): string {
    return this.value
  }

  equals(other: TenantId): boolean {
    return this.value === other.value
  }
}
