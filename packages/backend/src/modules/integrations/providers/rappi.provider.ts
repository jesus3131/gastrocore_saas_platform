import crypto from 'crypto'
import { injectable } from 'tsyringe'
import type { DeliveryOrder } from '../integration.types.js'

@injectable()
export class RappiProvider {
  private baseUrl = process.env.RAPPI_API_URL || 'https://api.rappi.com/v1'
  private orders: Map<string, DeliveryOrder> = new Map()

  private getHeaders(apiKey: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }
  }

  async handleOrderNotification(payload: Record<string, unknown>, apiKey: string): Promise<DeliveryOrder> {
    const customer = payload.customer as Record<string, unknown> | undefined
    const deliveryAddress = payload.delivery_address as Record<string, unknown> | undefined
    const order: DeliveryOrder = {
      id: crypto.randomUUID(),
      tenantId: '',
      provider: 'rappi',
      externalId: String(payload.order_id || payload.id || ''),
      customerName: String(customer?.name || payload.customer_name || 'Cliente Rappi'),
      customerPhone: String(customer?.phone || payload.customer_phone || ''),
      customerAddress: String(deliveryAddress?.address || payload.delivery_address || ''),
      items: Array.isArray(payload.items)
        ? (payload.items as any[]).map((i) => ({
            name: String(i.name || i.title || ''),
            quantity: Number(i.quantity || 1),
            price: Number(i.price || i.unit_price || 0),
          }))
        : [],
      total: Number(payload.total || payload.total_amount || 0),
      status: 'pending',
      notes: String(payload.notes || payload.special_instructions || ''),
      createdAt: new Date(),
    }
    this.orders.set(order.id, order)
    return order
  }

  async updateOrderStatus(orderId: string, status: string, apiKey: string) {
    const order = this.orders.get(orderId)
    if (order) {
      order.status = status as DeliveryOrder['status']
    }
    const res = await fetch(`${this.baseUrl}/orders/${order?.externalId || orderId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Rappi API error (${res.status}): ${text}`)
    }
    return { success: true, provider: 'rappi', orderId, status }
  }

  async syncMenu(items: { id: string; name: string; description?: string; price: number; category?: string; available: boolean }[], apiKey: string, storeId: string) {
    const res = await fetch(`${this.baseUrl}/stores/${storeId}/menu`, {
      method: 'PUT',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          category: item.category || '',
          available: item.available,
        })),
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Rappi menu sync error (${res.status}): ${text}`)
    }
    return { success: true, provider: 'rappi', syncedItems: items.length }
  }

  async getOrders() {
    return Array.from(this.orders.values())
  }
}
