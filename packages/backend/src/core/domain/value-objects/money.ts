export class Money {
  private constructor(
    private readonly amount: number,
  ) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error('Money amount must be a non-negative finite number')
    }
  }

  static fromNumber(amount: number): Money {
    return new Money(amount)
  }

  toNumber(): number {
    return this.amount
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount)
  }

  subtract(other: Money): Money {
    return new Money(this.amount - other.amount)
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount
  }
}
