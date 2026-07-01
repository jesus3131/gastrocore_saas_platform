import { injectable, inject } from 'tsyringe'
import type { CustomerRepository } from '../../ports/repositories/customer.repository.js'
import type { LoyaltyRepository } from '../../ports/repositories/loyalty.repository.js'

@injectable()
export class RedeemPointsUseCase {
  constructor(
    @inject('CustomerRepository') private readonly customerRepo: CustomerRepository,
    @inject('LoyaltyRepository') private readonly loyaltyRepo: LoyaltyRepository,
  ) {}

  async execute(tenantId: string, customerId: string, points: number, reward: string) {
    const customer = await this.customerRepo.findFirst({ where: { tenantId, id: customerId } })
    if (!customer) {
      const { AppError } = await import('../../../common/filters/error-handler.js')
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found')
    }
    if (customer.loyaltyPoints < points) {
      const { AppError } = await import('../../../common/filters/error-handler.js')
      throw new AppError(400, 'INSUFFICIENT_POINTS', `Customer has ${customer.loyaltyPoints} points but needs ${points}`)
    }

    const program = await this.loyaltyRepo.findProgram(tenantId)
    if (!program) {
      const { AppError } = await import('../../../common/filters/error-handler.js')
      throw new AppError(404, 'PROGRAM_NOT_FOUND', 'No loyalty program configured')
    }

    await this.customerRepo.update(customerId, { loyaltyPoints: { decrement: points } })
    await this.loyaltyRepo.createRedemption({ customerId, programId: program.id, points, reward })

    return { message: 'Points redeemed successfully', pointsRedeemed: points, reward }
  }
}
