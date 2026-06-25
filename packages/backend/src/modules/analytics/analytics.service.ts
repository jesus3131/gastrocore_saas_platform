import { prisma } from '../../config/database/prisma.js'
import type { BcgMatrixItem, SalesSummary } from '@gastrocore/shared'

export class AnalyticsService {
  async getSalesSummary(tenantId: string): Promise<SalesSummary> {
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        status: 'paid',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      include: { items: true },
    })

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
    const totalOrders = orders.length
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Peak hours analysis
    const hourCounts: Record<number, number> = {}
    orders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    const peakHours = Object.entries(hourCounts)
      .map(([hour, orders]) => ({ hour: Number(hour), orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)

    // Top items
    const itemCounts: Record<string, { name: string; quantity: number; revenue: number }> = {}
    orders.forEach((o) => {
      o.items.forEach((item) => {
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

  async getBcgMatrix(tenantId: string): Promise<BcgMatrixItem[]> {
    const orders = await prisma.order.findMany({
      where: { tenantId, status: 'paid' },
      include: { items: { include: { order: { select: { createdAt: true } } } } },
    })

    const items = await prisma.menuItem.findMany({
      where: { tenantId },
      include: { recipes: { include: { ingredients: { include: { ingredient: true } } } } },
    })

    const itemStats: Record<string, { revenue: number; quantity: number; cost: number; firstDate: Date; lastDate: Date }> = {}

    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!itemStats[item.menuItemId]) {
          const menuItem = items.find((mi) => mi.id === item.menuItemId)
          const recipeCost = menuItem?.recipes[0]?.ingredients.reduce(
            (sum, ri) => sum + Number(ri.ingredient.unitCost) * Number(ri.quantity), 0
          ) || 0

          itemStats[item.menuItemId] = {
            revenue: 0,
            quantity: 0,
            cost: recipeCost,
            firstDate: o.createdAt,
            lastDate: o.createdAt,
          }
        }
        itemStats[item.menuItemId].revenue += Number(item.totalPrice)
        itemStats[item.menuItemId].quantity += item.quantity
        itemStats[item.menuItemId].lastDate = o.createdAt
      })
    })

    const totalRevenue = Object.values(itemStats).reduce((sum, s) => sum + s.revenue, 0)

    return Object.entries(itemStats).map(([itemId, stats]) => {
      const menuItem = items.find((mi) => mi.id === itemId)
      const revenueShare = totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
      const profitMargin = stats.revenue > 0 ? ((stats.revenue - stats.cost * stats.quantity) / stats.revenue) * 100 : 0

      // Growth rate based on order frequency
      const daysActive = (stats.lastDate.getTime() - stats.firstDate.getTime()) / (1000 * 60 * 60 * 24) || 1
      const growthRate = stats.quantity / daysActive

      // BCG Quadrant classification
      const quadrant = revenueShare > 5
        ? (profitMargin > 50 ? 'star' as const : 'cash_cow' as const)
        : (profitMargin > 50 ? 'question_mark' as const : 'dog' as const)

      return {
        itemId,
        name: menuItem?.name || 'Unknown',
        category: 'General',
        revenue: stats.revenue,
        revenueShare,
        profitMargin,
        growthRate,
        quadrant,
      }
    })
  }

  async getPerformance(tenantId: string) {
    const now = new Date()
    const currentMonth = await prisma.order.aggregate({
      where: {
        tenantId,
        status: 'paid',
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
      _sum: { total: true },
      _count: { id: true },
    })

    const prevMonth = await prisma.order.aggregate({
      where: {
        tenantId,
        status: 'paid',
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          lt: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
      _sum: { total: true },
      _count: { id: true },
    })

    return {
      currentMonth: {
        revenue: currentMonth._sum.total || 0,
        orders: currentMonth._count.id,
      },
      previousMonth: {
        revenue: prevMonth._sum.total || 0,
        orders: prevMonth._count.id,
      },
      growth: {
        revenue: prevMonth._sum.total
          ? ((Number(currentMonth._sum.total) - Number(prevMonth._sum.total)) / Number(prevMonth._sum.total)) * 100
          : 0,
        orders: prevMonth._count.id
          ? ((currentMonth._count.id - prevMonth._count.id) / prevMonth._count.id) * 100
          : 0,
      },
    }
  }

  async getPeakHours(tenantId: string) {
    const orders = await prisma.order.findMany({
      where: { tenantId, status: 'paid' },
      select: { createdAt: true },
    })

    const hourDistribution: Record<number, number> = {}
    orders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours()
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1
    })

    return Object.entries(hourDistribution)
      .map(([hour, count]) => ({ hour: Number(hour), orders: count }))
      .sort((a, b) => a.hour - b.hour)
  }

  async getMultiBranchReport(tenantId: string) {
    const branches = await prisma.branch.findMany({ where: { tenantId, isActive: true } })

    const reports = await Promise.all(
      branches.map(async (branch) => {
        const orders = await prisma.order.findMany({
          where: { tenantId, branchId: branch.id, status: 'paid' },
          select: { total: true },
        })
        const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
        const ordersCount = orders.length
        return {
          branchId: branch.id,
          branchName: branch.name,
          revenue,
          ordersCount,
          averageTicket: ordersCount > 0 ? revenue / ordersCount : 0,
        }
      })
    )

    return reports
  }
}
