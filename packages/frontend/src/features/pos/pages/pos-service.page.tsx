import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { LoadingSkeleton, EmptyState, ErrorState } from '../../../shared/components/ui'
import { WaiterAuth } from '../../../shared/components/waiter-auth'
import { useAuthStore } from '../../../app/store/auth.store'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Check, Send, Search, Plus, Minus,
  Trash2, ImageOff, Table2, ChefHat, ClipboardList, ShoppingCart, Clock, LogOut, User,
} from 'lucide-react'

interface CartItem {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  imageUrl?: string
  notes?: string
}

const statusColors: Record<string, string> = {
  available: 'border-success bg-success/5 text-success',
  occupied: 'border-error bg-error/5 text-error',
  reserved: 'border-warning bg-warning/5 text-warning',
}

const statusLabels: Record<string, string> = {
  available: 'Disponible',
  occupied: 'Ocupada',
  reserved: 'Reservada',
}

function MenuItemCard({ item, onAdd }: { item: any; onAdd: (item: any) => void }) {
  const [imgError, setImgError] = useState(false)

  return (
    <button
      onClick={() => onAdd(item)}
      className="text-left rounded-xl border border-on-surface-muted/10 hover:border-primary/30 hover:shadow-lg active:scale-[0.97] transition-all overflow-hidden bg-surface touch-manipulation"
    >
      <div className="relative h-24 sm:h-28 bg-surface-container-high overflow-hidden">
        {item.imageUrl && !imgError ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high">
            <ImageOff className="w-7 h-7 text-on-surface-muted/30" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="text-xs font-bold bg-surface/90 text-primary px-2 py-0.5 rounded-full shadow-sm">
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-on-surface truncate">{item.name}</p>
        {item.description && (
          <p className="text-2xs text-on-surface-muted mt-0.5 line-clamp-2">{item.description}</p>
        )}
      </div>
    </button>
  )
}

export function PosServicePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const waiter = useAuthStore((s) => s.waiter)
  const setWaiter = useAuthStore((s) => s.setWaiter)

  const [step, setStep] = useState<'tables' | 'menu' | 'review'>('tables')
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderNotes, setOrderNotes] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [editItemId, setEditItemId] = useState<string | null>(null)
  const [itemNotes, setItemNotes] = useState('')

  const { data: branches, isLoading: loadingTables } = useQuery({
    queryKey: ['pos', 'tables'],
    queryFn: () => api.get('/pos/tables').then((r) => r.data.data),
  })

  const { data: menu } = useQuery({
    queryKey: ['pos', 'menu'],
    queryFn: () => api.get('/pos/menu').then((r) => r.data.data),
  })

  const createOrder = useMutation({
    mutationFn: (data: any) => api.post('/pos/orders', data).then((r) => r.data.data),
    onSuccess: () => {
      toast.success(`Comanda enviada a cocina - Mesa ${selectedTable?.label}`)
      setCart([])
      setOrderNotes('')
      setSelectedTable(null)
      setStep('tables')
      queryClient.invalidateQueries({ queryKey: ['pos'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al enviar comanda'),
  })

  const categories = menu || []

  const filteredCategories = useMemo(() => {
    if (!search) return categories
    return categories.filter((cat: any) =>
      cat.menuItems?.some((item: any) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [categories, search])

  const availableCategories = activeCategory
    ? categories.filter((c: any) => c.id === activeCategory)
    : filteredCategories

  const selectTable = (table: any) => {
    if (table.status === 'occupied') {
      toast.error('La mesa está ocupada')
      return
    }
    setSelectedTable(table)
    setStep('menu')
    setActiveCategory(null)
  }

  const addItem = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id)
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [{ menuItemId: item.id, name: item.name, quantity: 1, unitPrice: Number(item.price), imageUrl: item.imageUrl }, ...prev]
    })
    toast.success(`${item.name} agregado`, { duration: 1500 })
  }

  const updateQty = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      ).filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (menuItemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId))
  }

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSendToKitchen = () => {
    if (cart.length === 0 || !selectedTable) return
    createOrder.mutate({
      type: 'dine_in',
      tableId: selectedTable.id,
      branchId: selectedTable.branchId || branches?.[0]?.id,
      subtotal: total,
      total,
      notes: orderNotes,
      items: cart,
    })
  }

  const isSubmitting = createOrder.isPending

  if (!waiter) {
    return <WaiterAuth />
  }

  if (loadingTables) return <LoadingSkeleton rows={6} />

  const allTables = branches?.flatMap((b: any) => b.areas?.flatMap((a: any) => a.tables || []) || []) || []

  const handleLock = () => {
    setWaiter(null)
    setSelectedTable(null)
    setCart([])
    setStep('tables')
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        {step !== 'tables' && (
          <button
            onClick={() => { if (step === 'menu') { setStep('tables'); setSelectedTable(null); setCart([]) } else setStep('menu') }}
            className="btn-ghost btn-sm p-1.5 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-on-surface">Servicio a Mesas</h1>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium">
            <User className="w-3 h-3" /> {waiter.name}
          </div>
          <button onClick={handleLock} className="btn-ghost btn-sm p-1.5 text-on-surface-muted hover:text-error" title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${step === 'tables' ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-muted'}`}>
            <Table2 className="w-3 h-3" /> Mesa
          </div>
          <ArrowRight className="w-3 h-3 text-on-surface-muted/40" />
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${step === 'menu' ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-muted'}`}>
            <ClipboardList className="w-3 h-3" /> Pedido
          </div>
          <ArrowRight className="w-3 h-3 text-on-surface-muted/40" />
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${step === 'review' ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-muted'}`}>
            <Send className="w-3 h-3" /> Enviar
          </div>
        </div>
      </div>

      {step === 'tables' && (
        <div className="flex-1 overflow-y-auto">
          {branches?.length > 0 ? (
            <div className="space-y-4">
              {branches.map((branch: any) => (
                <div key={branch.id}>
                  <h2 className="text-sm font-semibold text-on-surface mb-3">{branch.name}</h2>
                  <div className="space-y-4">
                    {branch.areas?.map((area: any) => (
                      <div key={area.id} className="card">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-on-surface">{area.name}</h3>
                            <span className="badge-neutral text-2xs">{area.type === 'dining' ? 'Comedor' : area.type === 'terrace' ? 'Terraza' : area.type === 'bar' ? 'Barra' : area.type === 'vip' ? 'VIP' : area.type}</span>
                          </div>
                          <span className="text-xs text-on-surface-muted">
                            {area.tables?.filter((t: any) => t.status === 'available').length}/{area.tables?.length || 0} libres
                          </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                          {area.tables?.map((table: any) => (
                            <button
                              key={table.id}
                              onClick={() => selectTable(table)}
                              disabled={table.status === 'occupied'}
                              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 touch-manipulation min-h-[90px] ${
                                table.status === 'occupied'
                                  ? 'border-error/30 bg-error/5 text-error/50 cursor-not-allowed opacity-60'
                                  : statusColors[table.status] || 'border-success bg-success/5 text-success hover:shadow-lg hover:scale-[1.03] cursor-pointer'
                              }`}
                            >
                              <span className="text-lg font-bold">{table.label}</span>
                              <span className="text-xs mt-0.5">{table.capacity} pax</span>
                              {table.activeOrder && (
                                <span className="text-xs font-semibold mt-0.5">${Number(table.activeOrder.total).toFixed(0)}</span>
                              )}
                              <span className="text-2xs mt-1 opacity-70">{statusLabels[table.status] || table.status}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin mesas" message="Configura las mesas en Onboarding primero" />
          )}
        </div>
      )}

      {step === 'menu' && selectedTable && (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Menu panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search + Category tabs */}
            <div className="shrink-0 space-y-2 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setActiveCategory(null) }}
                  className="input pl-9 text-sm"
                  placeholder="Buscar platos..."
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    !activeCategory ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-muted hover:bg-surface-container'
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeCategory === cat.id ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-muted hover:bg-surface-container'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu items grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableCategories.map((cat: any) =>
                  cat.menuItems?.map((item: any) => (
                    <MenuItemCard key={item.id} item={item} onAdd={addItem} />
                  ))
                )}
              </div>
              {availableCategories.every((cat: any) => !cat.menuItems?.length) && (
                <EmptyState title="Sin resultados" message="No se encontraron platos con ese filtro" />
              )}
            </div>
          </div>

          {/* Cart panel - responsive */}
          <div className="lg:w-80 flex flex-col bg-surface rounded-xl border border-on-surface-muted/10 p-4 lg:max-h-full">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Mesa {selectedTable.label}</h3>
                <p className="text-2xs text-on-surface-muted">{itemCount} items · ${total.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setStep('review')}
                disabled={cart.length === 0}
                className="btn-primary btn-sm"
              >
                Revisar <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="w-8 h-8 text-on-surface-muted/30 mb-2" />
                  <p className="text-xs text-on-surface-muted">Toca los platos para agregarlos</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.menuItemId} className="flex items-center gap-2 p-2 rounded-lg bg-surface-container group">
                    {item.imageUrl && (
                      <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-surface-container-high">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{item.name}</p>
                      <p className="text-xs text-on-surface-muted">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.menuItemId, -1)} className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center active:scale-90 transition-all touch-manipulation">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-7 text-center tabular-nums">{item.quantity}</span>
                      <button onClick={() => updateQty(item.menuItemId, 1)} className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center active:scale-90 transition-all touch-manipulation">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.menuItemId)} className="w-8 h-8 rounded-lg hover:bg-error/10 flex items-center justify-center text-error/60 hover:text-error active:scale-90 transition-all touch-manipulation">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setStep('review')}
                className="btn-primary w-full mt-3 text-sm py-3"
              >
                Revisar Pedido ({itemCount} items) <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'review' && selectedTable && (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
          <div className="card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-on-surface-muted/10">
              <div>
                <h2 className="text-base font-bold text-on-surface">Revisar Comanda</h2>
                <p className="text-xs text-on-surface-muted">Mesa {selectedTable.label} · {selectedTable.capacity} pax</p>
              </div>
              <button onClick={() => setStep('menu')} className="btn-secondary btn-sm text-xs">
                <ArrowLeft className="w-3 h-3" /> Seguir agregando
              </button>
            </div>

            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.menuItemId} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{item.name}</p>
                    <p className="text-xs text-on-surface-muted">${item.unitPrice.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.menuItemId, -1)} className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center active:scale-90">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center tabular-nums">{item.quantity}</span>
                    <button onClick={() => updateQty(item.menuItemId, 1)} className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center active:scale-90">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-primary w-16 text-right tabular-nums">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <label className="label">Notas para la cocina</label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="input min-h-[60px] resize-none text-sm"
                placeholder="Ej: Sin cebolla, punto medio..."
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-on-surface-muted/10">
              <div>
                <p className="text-xs text-on-surface-muted">Total items</p>
                <p className="text-sm font-semibold">{itemCount} platos</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-muted">Total</p>
                <p className="text-xl font-bold text-primary tabular-nums">${total.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={handleSendToKitchen}
              disabled={cart.length === 0 || isSubmitting}
              className="btn-primary w-full py-3.5 text-base font-bold"
            >
              {isSubmitting ? (
                <>Enviando...</>
              ) : (
                <><Send className="w-5 h-5" /> Enviar Comanda a Cocina — ${total.toFixed(2)}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
