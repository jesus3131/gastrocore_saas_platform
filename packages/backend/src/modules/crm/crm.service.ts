import { inject, injectable } from 'tsyringe'
import { AppError } from '../../common/filters/error-handler.js'
import { RedeemPointsUseCase } from '../../core/use-cases/crm/redeem-points.use-case.js'
import type { CustomerRepository } from '../../core/ports/repositories/customer.repository.js'
import type { LoyaltyRepository } from '../../core/ports/repositories/loyalty.repository.js'

@injectable()
export class CrmService {
  constructor(
    @inject('CustomerRepository') private readonly customerRepo: CustomerRepository,
    @inject('LoyaltyRepository') private readonly loyaltyRepo: LoyaltyRepository,
    private readonly redeemPointsUseCase?: RedeemPointsUseCase,
  ) {}

  async getCustomers(tenantId: string) {
    return this.customerRepo.findMany(tenantId)
  }

  async getCustomer(tenantId: string, id: string) {
    const customer = await this.customerRepo.findFirst({ where: { tenantId, id } }, {
      orders: {
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    })
    if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found')
    return customer
  }

  async createCustomer(tenantId: string, data: any) {
    return this.customerRepo.create({ ...data, tenantId })
  }

  async updateCustomer(tenantId: string, id: string, data: any) {
    const customer = await this.customerRepo.findFirst({ where: { tenantId, id } })
    if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found')
    return this.customerRepo.update(id, data)
  }

  async getSegments(tenantId: string) {
    const customers = await this.customerRepo.findMany(tenantId)

    const totalSpentValues = customers.map((c: any) => Number(c.totalSpent))
    const avgSpent = totalSpentValues.reduce((a: number, b: number) => a + b, 0) / (totalSpentValues.length || 1)

    return [
      { name: 'VIP', condition: `Gasto total > $${(avgSpent * 2).toFixed(0)}`, count: customers.filter((c: any) => Number(c.totalSpent) > avgSpent * 2).length },
      { name: 'Regular', condition: `Gasto entre $${(avgSpent * 0.5).toFixed(0)} y $${(avgSpent * 2).toFixed(0)}`, count: customers.filter((c: any) => Number(c.totalSpent) >= avgSpent * 0.5 && Number(c.totalSpent) <= avgSpent * 2).length },
      { name: 'Ocasional', condition: `Gasto total < $${(avgSpent * 0.5).toFixed(0)}`, count: customers.filter((c: any) => Number(c.totalSpent) > 0 && Number(c.totalSpent) < avgSpent * 0.5).length },
      { name: 'Nuevo', condition: 'Sin compras registradas', count: customers.filter((c: any) => Number(c.totalSpent) === 0).length },
    ]
  }

  async getLoyaltyProgram(tenantId: string) {
    let program = await this.loyaltyRepo.findProgram(tenantId)

    if (!program) {
      program = await this.loyaltyRepo.createProgram({
        tenantId,
        name: 'Programa de Fidelización',
        pointsPerUnit: 10,
        unitPerPoint: 1,
        tiers: [
          { name: 'Bronce', minPoints: 0, discount: 0.05, color: '#CD7F32' },
          { name: 'Plata', minPoints: 500, discount: 0.10, color: '#C0C0C0' },
          { name: 'Oro', minPoints: 2000, discount: 0.15, color: '#FFD700' },
          { name: 'Platino', minPoints: 5000, discount: 0.20, color: '#E5E4E2' },
        ],
      })
    }

    if (program && typeof program.tiers === 'string') {
      program.tiers = JSON.parse(program.tiers as string)
    }
    return program
  }

  async redeemPoints(tenantId: string, data: { customerId: string; points: number; reward: string }) {
    if (this.redeemPointsUseCase) {
      return this.redeemPointsUseCase.execute(tenantId, data.customerId, data.points, data.reward)
    }

    const customer = await this.customerRepo.findFirst({ where: { tenantId, id: data.customerId } })
    if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found')
    if (customer.loyaltyPoints < data.points) throw new AppError(400, 'INSUFFICIENT_POINTS', 'Insufficient loyalty points')

    const program = await this.loyaltyRepo.findProgram(tenantId)
    if (!program) throw new AppError(404, 'PROGRAM_NOT_FOUND', 'Loyalty program not found')

    await this.customerRepo.update(data.customerId, { loyaltyPoints: { decrement: data.points } })

    return this.loyaltyRepo.createRedemption({
      customerId: data.customerId,
      programId: program.id,
      points: data.points,
      reward: data.reward,
    })
  }

  async getRewards(tenantId: string) {
    return this.loyaltyRepo.findRedemptionsByTenant(tenantId)
  }
}
