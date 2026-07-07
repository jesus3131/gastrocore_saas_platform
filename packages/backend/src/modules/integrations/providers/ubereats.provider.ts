import crypto from 'crypto'
import { injectable } from 'tsyringe'
import type { DeliveryOrder } from '../integration.types.js'

@injectable()
export class UberEatsProvider {
  private baseUrl = process.env.UBER_EATS_API_URL || 'https://api.uber.com/v1/eats'
  private orders: Map<string, DeliveryOrder> = new Map()

  private getHeaders(apiKey: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }
  }

  async handleOrderNotification(payload: Record<string, unknown>, apiKey: string): Promise<DeliveryOrder> {
    const diner = payload.diner as Record<string, unknown> | undefined
    const deliveryAddress = payload.delivery_address as Record<string, unknown> | undefined
    const cartItems = (payload.cart_items || payload.items || []) as any[]
    const order: DeliveryOrder = {
      id: crypto.randomUUID(),
      tenantId: '',
      provider: 'uber_eats',
      externalId: String(payload.order_id || payload.id || ''),
      customerName: String(diner?.name || payload.customer_name || 'Cliente Uber Eats'),
      customerPhone: String(diner?.phone || payload.customer_phone || ''),
      customerAddress: String(deliveryAddress?.formatted_address || payload.delivery_address || ''),
      items: Array.isArray(cartItems)
        ? cartItems.map((i) => ({
            name: String(i.title || i.name || ''),
            quantity: Number(i.quantity || 1),
            price: Number(i.total || i.price || 0) / Number(i.quantity || 1),
          }))
        : [],
      total: Number(payload.total || payload.charge_amount || 0),
      status: 'pending',
      notes: String(payload.special_instructions || payload.notes || ''),
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
      throw new Error(`Uber Eats API error (${res.status}): ${text}`)
    }
    return { success: true, provider: 'uber_eats', orderId, status }
  }

  async syncMenu(items: { id: string; name: string; description?: string; price: number; category?: string; available: boolean }[], apiKey: string, storeId: string) {
    const res = await fetch(`${this.baseUrl}/stores/${storeId}/menu`, {
      method: 'PUT',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({
        items: items.map((item) => ({
          id: item.id,
          title: item.name,
          description: item.description || '',
          price: Math.round(item.price * 100),
          category: item.category || '',
          available: item.available,
        })),
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Uber Eats menu sync error (${res.status}): ${text}`)
    }
    return { success: true, provider: 'uber_eats', syncedItems: items.length }
  }

  async getOrders() {
    return Array.from(this.orders.values())
  }
}
