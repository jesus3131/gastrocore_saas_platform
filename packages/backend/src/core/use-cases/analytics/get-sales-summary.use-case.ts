import { injectable, inject } from 'tsyringe'
import type { AnalyticsRepository } from '../../ports/repositories/analytics.repository.js'

@injectable()
export class GetSalesSummaryUseCase {
  constructor(
    @inject('AnalyticsRepository') private readonly analyticsRepo: AnalyticsRepository,
  ) {}

  async execute(tenantId: string) {
    const orders = await this.analyticsRepo.findOrders(tenantId, {
      status: 'paid',
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      include: { items: true },
    })

    const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0)
    const totalOrders = orders.length
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const hourCounts: Record<number, number> = {}
    orders.forEach((o: any) => {
      const hour = new Date(o.createdAt).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    const peakHours = Object.entries(hourCounts)
      .map(([hour, orders]) => ({ hour: Number(hour), orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)

    const itemCounts: Record<string, { name: string; quantity: number; revenue: number }> = {}
    orders.forEach((o: any) => {
      o.items.forEach((item: any) => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = { name: item.name, quantity: 0, revenue: 0 }
        }
        itemCounts[item.menuItemId].quantity += item.quantity
        itemCounts[item.menuItemId].revenue += Number(item.totalPrice)
      })
    })
    const topItems = Object.entries(itemCounts)
      .map(([itemId, data]) => ({ itemId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return { totalRevenue, totalOrders, averageTicket, peakHours, topItems }
  }
}
