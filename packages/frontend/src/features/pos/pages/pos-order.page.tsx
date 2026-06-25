import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, Minus, Trash2, Search, Send } from 'lucide-react'
import { api } from '../../../lib/api'

interface CartItem {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  notes?: string
}

export function PosOrderPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: menu } = useQuery({
    queryKey: ['pos', 'menu'],
    queryFn: () => api.get('/pos/menu').then((r) => r.data.data),
  })

  const createOrder = useMutation({
    mutationFn: (data: any) => api.post('/pos/orders', data).then((r) => r.data.data),
    onSuccess: () => {
      toast.success('Orden creada exitosamente')
      setCart([])
      queryClient.invalidateQueries({ queryKey: ['pos'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear orden'),
  })

  const addItem = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id)
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { menuItemId: item.id, name: item.name, quantity: 1, unitPrice: Number(item.price) }]
    })
  }

  const updateQty = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      ).filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (menuItemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId))
  }

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  const handleSubmit = () => {
    if (cart.length === 0) return
    createOrder.mutate({
      type: 'dine_in',
      subtotal: total,
      total,
      items: cart,
    })
  }

  const filteredCategories = menu?.filter((cat: any) =>
    cat.menuItems.some((item: any) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)] animate-fade-in">
      {/* Menu panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
              placeholder="Buscar platos..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {(search ? filteredCategories : menu)?.map((category: any) => (
            <div key={category.id}>
              <h3 className="text-sm font-semibold text-on-surface mb-2">{category.name}</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {category.menuItems?.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="text-left p-3 rounded-lg border border-on-surface-muted/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <p className="text-sm font-medium text-on-surface">{item.name}</p>
                    <p className="text-xs text-on-surface-muted mt-0.5">{item.description}</p>
                    <p className="text-sm font-semibold text-primary mt-1">${Number(item.price).toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart panel */}
      <div className="w-80 flex flex-col bg-surface rounded-lg border border-on-surface-muted/10 p-4">
        <h3 className="text-sm font-semibold text-on-surface mb-3">Orden Actual</h3>

        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.length === 0 && (
            <p className="text-xs text-on-surface-muted text-center py-8">Selecciona platos del menú</p>
          )}
          {cart.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-2 p-2 rounded-lg bg-surface-container">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{item.name}</p>
                <p className="text-xs text-on-surface-muted">${(item.unitPrice * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.menuItemId, -1)} className="btn-ghost btn-sm p-1">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.menuItemId, 1)} className="btn-ghost btn-sm p-1">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button onClick={() => removeItem(item.menuItemId)} className="btn-ghost btn-sm p-1 text-error">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-on-surface-muted/10 pt-3 mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-muted">Subtotal</span>
            <span className="font-medium">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || createOrder.isPending}
            className="btn-primary w-full"
          >
            <Send className="w-4 h-4" />
            {createOrder.isPending ? 'Enviando...' : `Enviar - $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
