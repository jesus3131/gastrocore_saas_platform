import { useState, useEffect, useCallback, useRef } from 'react'
import { UtensilsCrossed, ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Search, Check, Circle, LogOut, CreditCard, Banknote, Smartphone, ChevronRight, ChefHat, ClipboardList, Receipt, X, RefreshCw, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { io, type Socket } from 'socket.io-client'

type Step = 'login' | 'tables' | 'order' | 'payment'
type PaymentMethod = 'cash' | 'card' | 'digital_wallet'

interface WaiterState {
  token: string
  user: { id: string; name: string; email: string; tenantId: string; branchId?: string }
}

interface TableData {
  id: string
  label: string
  capacity: number
  status: string
  areaId: string
  activeOrder?: { id: string; total: number; status: string } | null
}

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

interface CartItem {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  notes: string
}

const API = '/api/v1/waiter'

function getHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

function clearSession() {
  localStorage.removeItem('waiter_session')
  localStorage.removeItem('waiter_tables')
  localStorage.removeItem('waiter_menu')
  window.location.reload()
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function WaiterLogin({ onLogin }: { onLogin: (state: WaiterState) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message || 'Error al iniciar sesión')
      const { user, token } = json.data
      onLogin({ token, user })
      localStorage.setItem('waiter_session', JSON.stringify({ token, user }))
      toast.success(`Bienvenido, ${user.name}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400/30 to-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
            <UtensilsCrossed className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Acceso Meseros</h1>
          <p className="text-slate-400 mt-1 text-sm">GastroCore POS</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="mesero@restaurante.com" className="input w-full bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="input w-full bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all rounded-xl" />
          </div>
          <button type="submit" disabled={loading} className="btn w-full py-3 text-base bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-bold disabled:opacity-50 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]">
            {loading ? (
              <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Entrando...</span>
            ) : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function getTableColor(status: string) {
  switch (status) {
    case 'occupied': return 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-amber-500/5 text-amber-300 shadow-amber-500/10'
    case 'bill_requested': return 'border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 text-emerald-300 shadow-emerald-500/10'
    default: return 'border-slate-600/30 bg-slate-800/40 text-slate-400 hover:border-slate-500/50 hover:bg-slate-700/40'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'occupied': return <Circle className="w-3 h-3 fill-amber-400 text-amber-400" />
    case 'bill_requested': return <Receipt className="w-3 h-3 text-emerald-400" />
    default: return null
  }
}

function TablePanel({ state, onStartOrder, onRequestBill }: { state: WaiterState; onStartOrder: (table: TableData) => void; onRequestBill: (table: TableData) => void }) {
  const [tables, setTables] = useState<TableData[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tables`, { headers: getHeaders(state.token) })
      if (res.status === 401) { clearSession(); return }
      const json = await res.json()
      if (json.success) {
        const all: TableData[] = json.data.flatMap((b: any) => (b.areas ?? []).flatMap((a: any) => (a.tables ?? [])))
        setTables(all)
        localStorage.setItem('waiter_tables', JSON.stringify(all))
      }
    } catch {
      const cached = localStorage.getItem('waiter_tables')
      if (cached) setTables(JSON.parse(cached))
    } finally {
      setLoading(false)
    }
  }, [state.token])

  useEffect(() => {
    fetchTables()
    const iv = setInterval(fetchTables, 15000)
    return () => clearInterval(iv)
  }, [fetchTables])

  useEffect(() => {
    const socket = io({ auth: { token: state.token }, transports: ['websocket', 'polling'] })
    socketRef.current = socket
    socket.on('order.created', () => { fetchTables() })
    socket.on('order.status_updated', () => { fetchTables() })
    return () => { socket.close() }
  }, [state.token, fetchTables])

  const filtered = tables.filter((t) => t.label.toLowerCase().includes(search.toLowerCase()))
  const occupiedCount = tables.filter((t) => t.status !== 'available').length

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400/30 to-amber-600/20 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm">{state.user.name}</span>
            <p className="text-2xs text-slate-500">Mesero</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchTables} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all active:scale-90">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { localStorage.removeItem('waiter_session'); localStorage.removeItem('waiter_tables'); window.location.reload() }} className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="p-4 pb-28">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-bold text-lg">Mesas</h2>
            <p className="text-xs text-slate-500">{occupiedCount} ocupadas · {tables.length - occupiedCount} libres</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar mesa..." className="input w-full bg-slate-800/40 border-slate-700/50 text-white placeholder:text-slate-500 pl-10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-xl transition-all" />
        </div>

        {loading && tables.length === 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-slate-800/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filtered.map((table) => (
              <button key={table.id} onClick={() => {
                if (table.status === 'available') onStartOrder(table)
                else if (table.activeOrder) onRequestBill(table)
              }} className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl border ${getTableColor(table.status)} transition-all active:scale-90 hover:shadow-lg`}>
                <div className="absolute top-2 right-2">{getStatusIcon(table.status)}</div>
                <span className="text-2xl font-black tracking-tight">{table.label}</span>
                <span className="text-xs mt-1 font-medium opacity-80">
                  {table.status === 'available' ? 'Libre' : table.activeOrder ? formatCurrency(table.activeOrder.total) : ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/50 px-4 py-3 flex justify-around text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><Circle className="w-2 h-2 fill-amber-400 text-amber-400" /> Ocupada</span>
        <span className="flex items-center gap-1.5"><Receipt className="w-3 h-3 text-emerald-400" /> Cuenta</span>
        <span className="flex items-center gap-1.5"><ClipboardList className="w-3 h-3 text-slate-400" /> Libre</span>
      </footer>
    </div>
  )
}

function OrderTaking({ state, table, onBack }: { state: WaiterState; table: TableData; onBack: () => void }) {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [noteInput, setNoteInput] = useState('')
  const [noteTarget, setNoteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [orderSent, setOrderSent] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const cached = localStorage.getItem('waiter_menu')
        if (cached) {
          const parsed = JSON.parse(cached) as MenuCategory[]
          setCategories(parsed)
          if (parsed.length) setActiveCategory(parsed[0].id)
        }
        const res = await fetch(`${API}/menu`, { headers: getHeaders(state.token) })
        const json = await res.json()
        if (json.success) {
          setCategories(json.data)
          if (json.data.length) setActiveCategory(json.data[0].id)
          localStorage.setItem('waiter_menu', JSON.stringify(json.data))
        }
      } catch {} finally { setLoading(false) }
    })()
  }, [state.token])

  const addItem = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItemId === item.id)
      if (existing) return prev.map((ci) => ci.menuItemId === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci)
      return [...prev, { menuItemId: item.id, name: item.name, quantity: 1, unitPrice: item.price, notes: '' }]
    })
  }

  const updateQty = (menuItemId: string, delta: number) => {
    setCart((prev) => prev.map((ci) => ci.menuItemId === menuItemId ? { ...ci, quantity: Math.max(0, ci.quantity + delta) } : ci).filter((ci) => ci.quantity > 0))
  }

  const updateNotes = (menuItemId: string, notes: string) => {
    setCart((prev) => prev.map((ci) => ci.menuItemId === menuItemId ? { ...ci, notes } : ci))
    setNoteTarget(null)
    setNoteInput('')
  }

  const subtotal = cart.reduce((s, ci) => s + ci.unitPrice * ci.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const submitOrder = async () => {
    if (!cart.length) return toast.error('Agrega al menos un producto')
    setSubmitting(true)
    try {
      const payload = {
        tableId: table.id, type: 'dine_in', subtotal, tax, discount: 0, total,
        items: cart.map((ci) => ({ menuItemId: ci.menuItemId, name: ci.name, quantity: ci.quantity, unitPrice: ci.unitPrice, notes: ci.notes || undefined })),
      }
      const res = await fetch(`${API}/orders`, { method: 'POST', headers: getHeaders(state.token), body: JSON.stringify(payload) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message || 'Error al crear orden')
      setOrderSent(true)
      setTimeout(() => { onBack() }, 2000)
    } catch (err: any) { toast.error(err.message) } finally { setSubmitting(false) }
  }

  const searchFiltered = (items: MenuItem[]) => {
    if (!searchTerm) return items
    const q = searchTerm.toLowerCase()
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))
  }

  const activeItems = searchTerm
    ? categories.flatMap((c) => searchFiltered(c.items))
    : searchFiltered(categories.find((c) => c.id === activeCategory)?.items || [])

  if (orderSent) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Comanda enviada!</h2>
          <p className="text-slate-400">Mesa {table.label} · {formatCurrency(total)}</p>
          <p className="text-xs text-slate-500 mt-4">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all active:scale-90"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-sm">Mesa {table.label}</h2>
          <p className="text-2xs text-slate-500 truncate">Nuevo pedido · {cart.reduce((s, ci) => s + ci.quantity, 0)} items</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-slate-900 text-2xs font-bold rounded-full flex items-center justify-center">
                {cart.reduce((s, ci) => s + ci.quantity, 0)}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar platos..." className="input w-full bg-slate-800/40 border-slate-700/50 text-white placeholder:text-slate-500 pl-10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-xl text-sm transition-all" />
        </div>
      </div>

      {!searchTerm && (
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2 hide-scrollbar">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 shadow-md shadow-amber-500/20' : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60 border border-slate-700/30'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 pb-48 space-y-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 animate-pulse">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-700/50 rounded w-2/3" />
                <div className="h-3 bg-slate-700/30 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : activeItems.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">{searchTerm ? 'Sin resultados' : 'Categoría sin platos'}</p>
          </div>
        ) : (
          activeItems.map((item) => (
            <div key={item.id} onClick={() => addItem(item)} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 active:scale-[0.98] transition-all cursor-pointer hover:border-amber-500/30 hover:bg-slate-800/50">
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{item.name}</p>
                {item.description && <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>}
                <p className="text-amber-400 font-bold text-sm mt-1">{formatCurrency(item.price)}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 ml-3">
                <Plus className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 rounded-t-2xl max-h-[50vh] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/50">
            <span className="text-white font-bold text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" /> Cuenta
            </span>
            <span className="text-amber-400 font-bold">{formatCurrency(total)}</span>
          </div>
          <div className="overflow-y-auto flex-1 px-4 py-2 space-y-1.5">
            {cart.map((ci) => (
              <div key={ci.menuItemId} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/30">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ci.name}</p>
                  {ci.notes && <p className="text-2xs text-slate-500 italic truncate">"{ci.notes}"</p>}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-lg px-1.5 py-1">
                  <button onClick={() => updateQty(ci.menuItemId, -1)} className="p-0.5 text-slate-400 hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
                  <span className="text-white font-bold text-sm w-5 text-center tabular-nums">{ci.quantity}</span>
                  <button onClick={() => updateQty(ci.menuItemId, 1)} className="p-0.5 text-slate-400 hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                </div>
                <span className="text-slate-300 text-sm font-medium w-16 text-right tabular-nums">{formatCurrency(ci.unitPrice * ci.quantity)}</span>
                <button onClick={() => { setNoteTarget(ci.menuItemId); setNoteInput(ci.notes) }} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"><ChefHat className="w-3.5 h-3.5" /></button>
                <button onClick={() => updateQty(ci.menuItemId, -ci.quantity)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-800/50">
            <button onClick={submitOrder} disabled={submitting} className="btn w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all active:scale-[0.98]">
              {submitting ? (
                <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Enviando...</span>
              ) : `Enviar a cocina — ${formatCurrency(total)}`}
            </button>
          </div>
        </div>
      )}

      {noteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in" onClick={() => setNoteTarget(null)}>
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-5 border border-slate-700/50 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><ChefHat className="w-4 h-4 text-amber-400" /> Nota de preparación</h3>
            <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Ej: Término medio, Sin cebolla..." className="input w-full bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-500 h-24 resize-none rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30" />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setNoteTarget(null)} className="btn flex-1 bg-slate-700/50 text-slate-300 hover:bg-slate-700 rounded-xl font-medium transition-all">Cancelar</button>
              <button onClick={() => updateNotes(noteTarget, noteInput)} className="btn flex-1 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-bold hover:from-amber-400 hover:to-amber-300 rounded-xl transition-all">Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PaymentStep({ state, table, onBack }: { state: WaiterState; table: TableData; onBack: () => void }) {
  const [bill, setBill] = useState<{ id: string; total: number; subtotal: number; tax: number } | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [tipPct, setTipPct] = useState(10)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API}/tables/${table.id}/bill`, { method: 'POST', headers: getHeaders(state.token) })
        const json = await res.json()
        if (json.success) {
          const o = json.data
          setBill({ id: o.id, total: Number(o.total), subtotal: Number(o.total) - Number(o.tax || 0), tax: Number(o.tax || 0) })
        }
      } catch {} finally { setLoading(false) }
    })()
  }, [state.token, table.id])

  const tipAmount = bill ? bill.total * (tipPct / 100) : 0
  const grandTotal = bill ? bill.total + tipAmount : 0

  const handlePayment = async () => {
    if (!bill) return
    setProcessing(true)
    try {
      const res = await fetch(`${API}/tables/${table.id}/pay`, { method: 'POST', headers: getHeaders(state.token), body: JSON.stringify({ method, tip: tipAmount, paidAmount: grandTotal }) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message || 'Error al procesar pago')
      setPaid(true)
      setTimeout(() => onBack(), 2000)
    } catch (err: any) { toast.error(err.message) } finally { setProcessing(false) }
  }

  if (paid) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Pago exitoso!</h2>
          <p className="text-slate-400">Mesa {table.label} liberada · {formatCurrency(grandTotal)}</p>
        </div>
      </div>
    )
  }

  if (loading) return <div className="min-h-dvh bg-slate-950 flex items-center justify-center"><RefreshCw className="w-6 h-6 text-slate-500 animate-spin" /></div>

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all active:scale-90"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h2 className="text-white font-semibold text-sm">Cobro — Mesa {table.label}</h2>
          <p className="text-2xs text-slate-500">Revisa el consumo y procesa el pago</p>
        </div>
      </header>
      <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-slate-300"><span className="text-sm">Subtotal</span><span className="font-medium">{bill ? formatCurrency(bill.subtotal) : '-'}</span></div>
          <div className="flex justify-between text-slate-400 text-sm"><span>IVA (8%)</span><span>{bill ? formatCurrency(bill.tax) : '-'}</span></div>
          <div className="border-t border-slate-700/50 pt-3 flex justify-between text-white font-bold text-lg"><span>Total consumo</span><span className="text-amber-400">{bill ? formatCurrency(bill.total) : '-'}</span></div>
        </div>

        <div>
          <p className="text-sm text-slate-400 mb-2 font-medium">Propina</p>
          <div className="flex gap-2">
            {[0, 10, 15, 20].map((pct) => (
              <button key={pct} onClick={() => setTipPct(pct)} className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${tipPct === pct ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10' : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600'}`}>
                <div>{pct === 0 ? 'Sin' : `${pct}%`}</div>
                <div className="text-xs opacity-70">{formatCurrency(bill ? bill.total * pct / 100 : 0)}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-slate-400 mb-2 font-medium">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {([['cash', 'Efectivo', Banknote], ['card', 'Tarjeta', CreditCard], ['digital_wallet', 'Digital', Smartphone]] as const).map(([val, label, Icon]) => (
              <button key={val} onClick={() => setMethod(val)} className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border transition-all ${method === val ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10' : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600'}`}>
                <Icon className="w-5 h-5" /><span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5 text-center">
          <p className="text-sm text-slate-400">Total a cobrar</p>
          <p className="text-3xl font-black text-amber-400 mt-1 tabular-nums">{formatCurrency(grandTotal)}</p>
        </div>

        <button onClick={handlePayment} disabled={processing || !bill} className="btn w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-[0.98]">
          {processing ? (
            <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Procesando...</span>
          ) : `Cobrar ${formatCurrency(grandTotal)}`}
        </button>
      </div>
    </div>
  )
}

export function WaiterApp() {
  const [step, setStep] = useState<Step>('login')
  const [waiterState, setWaiterState] = useState<WaiterState | null>(null)
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('waiter_session')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WaiterState
        setWaiterState(parsed)
        setStep('tables')
      } catch { localStorage.removeItem('waiter_session') }
    }
    setReady(true)
  }, [])

  const handleLogin = (ws: WaiterState) => {
    setWaiterState(ws)
    setStep('tables')
  }

  const handleStartOrder = (table: TableData) => {
    setSelectedTable(table)
    setStep('order')
  }

  const handleRequestBill = (table: TableData) => {
    setSelectedTable(table)
    setStep('payment')
  }

  const handleBack = () => { setStep('tables'); setSelectedTable(null) }

  if (!ready) return null

  if (!waiterState) return <WaiterLogin onLogin={handleLogin} />

  switch (step) {
    case 'tables': return <TablePanel state={waiterState} onStartOrder={handleStartOrder} onRequestBill={handleRequestBill} />
    case 'order': return selectedTable ? <OrderTaking state={waiterState} table={selectedTable} onBack={handleBack} /> : null
    case 'payment': return selectedTable ? <PaymentStep state={waiterState} table={selectedTable} onBack={handleBack} /> : null
    default: return null
  }
}
