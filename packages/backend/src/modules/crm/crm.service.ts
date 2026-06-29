import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'

export class CrmService {
  async getCustomers(tenantId: string) {
    return prisma.customer.findMany({
      where: { tenantId },
      orderBy: { totalSpent: 'desc' },
      take: 100,
    })
  }

  async getCustomer(tenantId: string, id: string) {
    const customer = await prisma.customer.findFirst({
      where: { tenantId, id },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found')
    return customer
  }

  async createCustomer(tenantId: string, data: any) {
    return prisma.customer.create({ data: { ...data, tenantId } })
  }

  async updateCustomer(tenantId: string, id: string, data: any) {
    const customer = await prisma.customer.findFirst({ where: { tenantId, id } })
    if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found')
    return prisma.customer.update({ where: { id }, data })
  }

  async getSegments(tenantId: string) {
    const customers = await prisma.customer.findMany({ where: { tenantId } })

    // Dynamic segment analysis
    const totalSpentValues = customers.map((c) => Number(c.totalSpent))
    const avgSpent = totalSpentValues.reduce((a, b) => a + b, 0) / (totalSpentValues.length || 1)

    return [
      { name: 'VIP', condition: `Gasto total > $${(avgSpent * 2).toFixed(0)}`, count: customers.filter((c) => Number(c.totalSpent) > avgSpent * 2).length },
      { name: 'Regular', condition: `Gasto entre $${(avgSpent * 0.5).toFixed(0)} y $${(avgSpent * 2).toFixed(0)}`, count: customers.filter((c) => Number(c.totalSpent) >= avgSpent * 0.5 && Number(c.totalSpent) <= avgSpent * 2).length },
      { name: 'Ocasional', condition: `Gasto total < $${(avgSpent * 0.5).toFixed(0)}`, count: customers.filter((c) => Number(c.totalSpent) > 0 && Number(c.totalSpent) < avgSpent * 0.5).length },
      { name: 'Nuevo', condition: 'Sin compras registradas', count: customers.filter((c) => Number(c.totalSpent) === 0).length },
    ]
  }

  async getLoyaltyProgram(tenantId: string) {
    let program = await prisma.loyaltyProgram.findFirst({ where: { tenantId, isActive: true } })

    if (!program) {
      // Create default loyalty program
      program = await prisma.loyaltyProgram.create({
        data: {
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
        },
      })
    }

    // Ensure tiers is a parsed array (not a JSON string)
    if (program && typeof program.tiers === 'string') {
      program.tiers = JSON.parse(program.tiers as string)
    }
    return program
  }

  async redeemPoints(tenantId: string, data: { customerId: string; points: number; reward: string }) {
    const customer = await prisma.customer.findFirst({ where: { tenantId, id: data.customerId } })
    if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found')
    if (customer.loyaltyPoints < data.points) throw new AppError(400, 'INSUFFICIENT_POINTS', 'Insufficient loyalty points')

    const program = await prisma.loyaltyProgram.findFirst({ where: { tenantId, isActive: true } })
    if (!program) throw new AppError(404, 'PROGRAM_NOT_FOUND', 'Loyalty program not found')

    await prisma.customer.updateMany({
      where: { tenantId, id: data.customerId },
      data: { loyaltyPoints: { decrement: data.points } },
    })

    return prisma.loyaltyRedemption.create({
      data: {
        customerId: data.customerId,
        programId: program.id,
        points: data.points,
        reward: data.reward,
      },
    })
  }

  async getRewards(tenantId: string) {
    return prisma.loyaltyRedemption.findMany({
      where: { program: { tenantId } },
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }
}
