import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, Minus, Trash2, Search, Send, ImageOff } from 'lucide-react'
import { api } from '../../../lib/api'

interface CartItem {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  imageUrl?: string
  notes?: string
}

const DEFAULT_IMAGE = 'https://placehold.co/200x150/E2E8F0/64748B?text=Sin+Imagen'

function MenuItemCard({ item, onAdd }: { item: any; onAdd: (item: any) => void }) {
  const [imgError, setImgError] = useState(false)

  return (
    <button
      onClick={() => onAdd(item)}
      className="text-left rounded-lg border border-on-surface-muted/10 hover:border-primary/30 hover:shadow-md hover:bg-primary/[0.02] transition-all overflow-hidden group"
    >
      <div className="relative h-28 bg-surface-container-high overflow-hidden">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high">
            <ImageOff className="w-8 h-8 text-on-surface-muted/30" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="text-xs font-bold bg-surface/90 text-primary px-2 py-0.5 rounded-full shadow-sm">
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-on-surface truncate">{item.name}</p>
        {item.description && (
          <p className="text-2xs text-on-surface-muted mt-0.5 line-clamp-2">{item.description}</p>
        )}
      </div>
    </button>
  )
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
      return [{
        menuItemId: item.id,
        name: item.name,
        quantity: 1,
        unitPrice: Number(item.price),
        imageUrl: item.imageUrl,
      }, ...prev]
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
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

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
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)] animate-fade-in">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
              placeholder="Buscar platos por nombre o descripción..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {(search ? filteredCategories : menu)?.map((category: any) => (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-on-surface">{category.name}</h3>
                <span className="badge-neutral text-2xs">{category.menuItems?.length || 0} platos</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {category.menuItems?.map((item: any) => (
                  <MenuItemCard key={item.id} item={item} onAdd={addItem} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-80 flex flex-col bg-surface rounded-lg border border-on-surface-muted/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-on-surface">Orden Actual</h3>
          {itemCount > 0 && (
            <span className="badge-primary text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
              {itemCount} items
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-on-surface-muted/40" />
              </div>
              <p className="text-xs text-on-surface-muted">Selecciona platos del menú</p>
              <p className="text-2xs text-on-surface-muted/60 mt-1">Haz clic en un plato para agregarlo</p>
            </div>
          )}
          {cart.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-2 p-2 rounded-lg bg-surface-container group">
              {item.imageUrl && (
                <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-surface-container-high">
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{item.name}</p>
                <p className="text-xs text-on-surface-muted">${(item.unitPrice * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.menuItemId, -1)} className="btn-ghost btn-sm p-1">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-medium w-6 text-center tabular-nums">{item.quantity}</span>
                <button onClick={() => updateQty(item.menuItemId, 1)} className="btn-ghost btn-sm p-1">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button onClick={() => removeItem(item.menuItemId)} className="btn-ghost btn-sm p-1 text-error opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-on-surface-muted/10 pt-3 mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-muted">Subtotal</span>
            <span className="font-medium tabular-nums">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-primary tabular-nums">${total.toFixed(2)}</span>
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
