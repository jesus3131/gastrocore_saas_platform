import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Search, LogOut,
  RefreshCw, Clock, CheckCircle2, ChefHat, Receipt, CreditCard,
  Banknote, Smartphone, Send, User, UtensilsCrossed, ImageOff,
  AlertCircle, Mail, Fingerprint, X
} from 'lucide-react'
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
  waiterId?: string | null
  waiterName?: string | null
  activeOrder?: { id: string; total: number; status: string; createdAt?: string; updatedAt?: string } | null
}

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  imageUrl?: string
}

interface MenuCategory {
  id: string
  name: string
  menuItems: MenuItem[]
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

const statusStyleMap: Record<string, { border: string; bg: string; text: string; label: string }> = {
  available: {
    border: 'border-gray-200 hover:border-gray-400',
    bg: 'bg-white hover:bg-gray-50',
    text: 'text-gray-400 group-hover:text-gray-600',
    label: 'Libre'
  },
  taking_order: {
    border: 'border-sky-500',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    label: 'Tomando pedido'
  },
  occupied: {
    border: 'border-blue-900',
    bg: 'bg-blue-900',
    text: 'text-blue-100',
    label: 'Ocupada'
  },
  bill_requested: {
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    label: 'Cuenta'
  },
  cleaning: {
    border: 'border-teal-400',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    label: 'Limpieza'
  },
  reserved: {
    border: 'border-purple-400',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    label: 'Reservada'
  },
}

function getDuration(date: string | Date) {
  const min = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (min < 1) return 'Ahora'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  return `${h}h ${min % 60}m`
}

function WaiterLogin({ onLogin }: { onLogin: (state: WaiterState) => void }) {
  const [tab, setTab] = useState<'email' | 'pin'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [tenants, setTenants] = useState<{ id: string; name: string; slug: string }[]>([])
  const [tenantSlug, setTenantSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tab === 'pin') {
      fetch(`${API}/tenants`)
        .then((r) => r.json())
        .then((j) => { if (j.success) { setTenants(j.data); if (j.data.length === 1) setTenantSlug(j.data[0].slug) } })
        .catch(() => {})
    }
  }, [tab])

  const handleEmailLogin = async (e: React.FormEvent) => {
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

  const handlePinDigit = (digit: string) => {
    setError('')
    const next = pin + digit
    setPin(next)
    if (next.length === 4) submitPin(next)
  }

  const submitPin = async (fullPin: string) => {
    if (!tenantSlug) { setError('Selecciona un restaurante'); setPin(''); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: fullPin, tenantSlug }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message || 'PIN inválido')
      const { user, token } = json.data
      onLogin({ token, user })
      localStorage.setItem('waiter_session', JSON.stringify({ token, user }))
      toast.success(`Bienvenido, ${user.name}`)
    } catch (err: any) {
      setError(err.message)
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#eff4ff] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-900/10 rounded-[8px] flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-blue-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Acceso Meseros</h1>
          <p className="text-gray-500 mt-1 text-sm">GastroCore POS</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-[8px] p-6 shadow-sm">
          <div className="flex mb-6 bg-[#eff4ff] rounded-[8px] p-1">
            <button onClick={() => { setTab('email'); setError('') }} className={`flex-1 py-2 rounded-[8px] text-sm font-medium transition-all ${tab === 'email' ? 'bg-blue-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
              <Mail className="w-4 h-4 inline mr-1.5" /> Email
            </button>
            <button onClick={() => { setTab('pin'); setError('') }} className={`flex-1 py-2 rounded-[8px] text-sm font-medium transition-all ${tab === 'pin' ? 'bg-blue-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
              <Fingerprint className="w-4 h-4 inline mr-1.5" /> PIN
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[8px] px-4 py-3 text-red-600 text-sm flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {tab === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="mesero@restaurante.com" className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-[8px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-[8px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-sm" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-[8px] disabled:opacity-50 transition-all active:scale-[0.98] text-sm">
                {loading ? (
                  <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Entrando...</span>
                ) : 'Entrar'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Restaurante</label>
                {tenants.length === 0 ? (
                  <div className="h-11 rounded-[8px] bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <select value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-[8px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-sm">
                    <option value="">Seleccionar restaurante</option>
                    {tenants.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
                  </select>
                )}
              </div>
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-3">PIN de mesero</label>
                <div className="flex justify-center gap-3 mb-5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${i < pin.length ? 'border-blue-900 bg-blue-900' : loading && i === pin.length ? 'border-blue-900 border-dashed animate-pulse' : 'border-gray-300'}`} />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
                  {['1','2','3','4','5','6','7','8','9','','0',''].map((d, i) => (
                    d ? (
                      <button key={i} onClick={() => handlePinDigit(d)} disabled={loading || pin.length >= 4} className="h-14 rounded-[8px] bg-white text-xl font-bold text-gray-900 hover:bg-gray-50 active:scale-90 transition-all disabled:opacity-30 shadow-sm border border-gray-200">
                        {d}
                      </button>
                    ) : <div key={i} />
                  ))}
                </div>
                <button onClick={() => { setPin(''); setError('') }} disabled={pin.length === 0 || loading} className="mt-3 h-10 px-5 rounded-[8px] bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 active:scale-90 transition-all disabled:opacity-30 text-sm font-medium">
                  Borrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
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
    socket.on('table.status_changed', () => { fetchTables() })
    return () => { socket.close() }
  }, [state.token, fetchTables])

  const filtered = tables.filter((t) => t.label.toLowerCase().includes(search.toLowerCase()))
  const counts = { taking: 0, occupied: 0, bill: 0, cleaning: 0, free: 0 }
  tables.forEach((t) => {
    if (t.status === 'taking_order') counts.taking++
    else if (t.status === 'occupied') counts.occupied++
    else if (t.status === 'bill_requested') counts.bill++
    else if (t.status === 'cleaning') counts.cleaning++
    else counts.free++
  })

  return (
    <div className="min-h-dvh bg-[#eff4ff] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-blue-900/10 border border-blue-900/20 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-900" />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900">{state.user.name}</span>
            <p className="text-xs text-gray-500">Mesero</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchTables} className="p-2 text-gray-400 hover:text-blue-900 transition-colors" title="Sincronizar">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={clearSession} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Cerrar Sesión">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mesas</h1>
              <p className="text-gray-500 text-sm mt-1">
                {counts.taking ? `${counts.taking} tomando · ` : ''}{counts.occupied} ocupadas{counts.bill ? ` · ${counts.bill} cuenta` : ''}{counts.cleaning ? ` · ${counts.cleaning} limpieza` : ''} · {counts.free} libres
              </p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar mesa..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-[8px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-sm shadow-sm" />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 lg:px-8 pb-8 overflow-y-auto">
        {loading && tables.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-[8px] bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((table) => {
              const s = statusStyleMap[table.status] || statusStyleMap.available
              const isTaking = table.status === 'taking_order'
              const isOccupied = table.status === 'occupied'
              const isBill = table.status === 'bill_requested'
              return (
                <button key={table.id} onClick={async () => {
                  if (table.status === 'available') {
                    try {
                      await fetch(`${API}/tables/${table.id}/open`, { method: 'POST', headers: getHeaders(state.token) })
                      onStartOrder(table)
                    } catch { toast.error('Error al abrir la mesa') }
                  } else if (table.status === 'taking_order') {
                    onStartOrder(table)
                  } else if (table.activeOrder) onRequestBill(table)
                }} className={`aspect-square ${s.bg} border-2 ${s.border} rounded-[8px] flex flex-col items-center justify-center transition-all relative overflow-hidden group ${isOccupied ? 'shadow-md shadow-blue-900/20' : ''}`}>
                  {isOccupied && table.activeOrder?.createdAt && (
                    <div className="absolute top-3 right-3 text-white/70 text-xs font-medium">
                      {getDuration(table.activeOrder.createdAt)}
                    </div>
                  )}
                  {isBill && table.activeOrder?.updatedAt && (
                    <div className="absolute top-3 right-3 text-amber-600 text-xs font-medium">
                      {getDuration(table.activeOrder.updatedAt)}
                    </div>
                  )}
                  <span className={`text-4xl font-bold mb-1 ${isOccupied ? 'text-white' : s.text}`}>{table.label}</span>
                  <span className={`text-sm font-medium ${isOccupied ? 'text-blue-100' : s.text}`}>{s.label}</span>
                  {(isTaking || isOccupied) && (
                    <div className={`mt-4 px-3 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${isOccupied ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'}`}>
                      <User className="w-3 h-3" />
                      {table.waiterName || table.capacity}
                    </div>
                  )}
                  {isBill && table.activeOrder && (
                    <div className="mt-4 px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium flex items-center gap-1">
                      <Receipt className="w-3 h-3" />
                      {formatCurrency(table.activeOrder.total)}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <footer className="h-14 bg-white border-t border-gray-200 px-4 lg:px-8 flex items-center justify-center gap-4 md:gap-6 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-500" />
          <span className="text-sm font-medium text-gray-600">Tomando</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-900" />
          <span className="text-sm font-medium text-gray-600">Ocupada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-sm font-medium text-gray-600">Cuenta</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal-400" />
          <span className="text-sm font-medium text-gray-600">Limpieza</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-gray-300" />
          <span className="text-sm font-medium text-gray-600">Libre</span>
        </div>
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
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [orderSent, setOrderSent] = useState(false)
  const [showMobileCart, setShowMobileCart] = useState(false)

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
    ? categories.flatMap((c) => searchFiltered(c.menuItems))
    : searchFiltered(categories.find((c) => c.id === activeCategory)?.menuItems || [])

  const totalItems = cart.reduce((s, ci) => s + ci.quantity, 0)

  if (orderSent) {
    return (
      <div className="min-h-dvh bg-[#f8f9ff] flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Comanda enviada!</h2>
          <p className="text-gray-500">Mesa {table.label} · {formatCurrency(total)}</p>
          <p className="text-xs text-gray-400 mt-4">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#f8f9ff] flex flex-col" style={{ fontFamily: "'Hanken Grotesk', 'Inter', sans-serif" }}>
      <header className="bg-[#eff4ff] border-b border-[#c2c7d7] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-blue-900 hover:bg-[#e9effa] rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold leading-tight text-blue-900">Mesa {table.label}</h1>
            <p className="text-xs text-[#727786] font-medium">Nuevo pedido · {totalItems} items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-[#727786] font-medium bg-[#e9effa] px-3 py-1.5 rounded-full border border-[#c2c7d7]">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{state.user.name}</span>
          </div>
          <button onClick={() => setShowMobileCart(!showMobileCart)} className="lg:hidden relative p-2 text-blue-900 hover:bg-[#e9effa] rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden">
        <div className="flex-grow flex flex-col lg:w-2/3 border-r border-[#c2c7d7] bg-white h-full overflow-hidden">
          <div className="p-4 border-b border-[#c2c7d7] bg-white shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#727786]" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar platos, ingredientes o referencias..." className="block w-full pl-10 pr-3 py-2.5 border border-[#c2c7d7] rounded-[8px] bg-white text-gray-900 placeholder-[#727786] focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all text-sm" />
            </div>
            {!searchTerm && categories.length > 0 && (
              <nav className="flex gap-2 overflow-x-auto pt-4">
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-all active:scale-95 flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-blue-900 text-white border-blue-900 font-semibold'
                      : 'bg-white border-[#c2c7d7] text-gray-700 hover:bg-[#eff4ff]'
                  }`}>
                    <ChefHat className="w-4 h-4" />
                    {cat.name}
                  </button>
                ))}
              </nav>
            )}
          </div>

          <div className="flex-grow overflow-y-auto p-4 bg-[#f8f9ff]">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
                    <div className="h-32 bg-gray-200 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Search className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">{searchTerm ? 'Sin resultados' : 'Categoría sin platos'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeItems.map((item) => (
                  <div key={item.id} onClick={() => addItem(item)} className="bg-white rounded-[8px] border border-[#c2c7d7] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-pointer">
                    <div className="h-32 bg-[#d0dbed] relative overflow-hidden">
                      {item.imageUrl && !imgErrors.has(item.id) ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => setImgErrors((prev) => new Set(prev).add(item.id))} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#eff4ff] to-[#d0dbed]">
                          <ImageOff className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">{item.name}</h3>
                      {item.description && <p className="text-xs text-[#727786] mb-2 line-clamp-2">{item.description}</p>}
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-bold text-blue-900">{formatCurrency(item.price)}</span>
                        <button className="w-8 h-8 rounded-full bg-[#eff4ff] text-blue-900 hover:bg-blue-900 hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`w-full lg:w-1/3 bg-white h-full flex flex-col ${showMobileCart ? 'fixed inset-0 z-50 lg:static lg:flex' : 'hidden lg:flex'}`}>
          <div className="p-4 border-b border-[#c2c7d7] bg-[#eff4ff] shrink-0 flex items-center justify-between">
            <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Orden Activa
            </h2>
            <button onClick={() => setShowMobileCart(false)} className="lg:hidden p-1 text-[#727786] hover:text-gray-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-16 h-16 text-[#c2c7d7] mb-4" />
                <p className="text-gray-900 font-medium">La orden está vacía</p>
                <p className="text-sm text-[#727786] mt-1">Selecciona items del menú para agregarlos.</p>
              </div>
            ) : (
              cart.map((ci) => (
                <div key={ci.menuItemId} className="flex flex-col gap-2 p-3 bg-[#f8f9ff] rounded-[8px] border border-[#c2c7d7]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{ci.name}</h4>
                      {ci.notes && <p className="text-xs text-[#727786]">"{ci.notes}"</p>}
                    </div>
                    <span className="font-bold text-sm text-gray-900">{formatCurrency(ci.unitPrice * ci.quantity)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <button onClick={() => { setNoteTarget(ci.menuItemId); setNoteInput(ci.notes) }} className="text-xs text-blue-900 font-medium hover:underline">
                      {ci.notes ? 'Editar notas' : 'Agregar notas'}
                    </button>
                    <div className="flex items-center gap-3 bg-white border border-[#c2c7d7] rounded-full px-2 py-1">
                      <button onClick={() => updateQty(ci.menuItemId, -1)} className="text-[#727786] hover:text-blue-900 flex items-center"><Minus className="w-4 h-4" /></button>
                      <span className="text-sm font-semibold w-4 text-center tabular-nums">{ci.quantity}</span>
                      <button onClick={() => updateQty(ci.menuItemId, 1)} className="text-[#727786] hover:text-blue-900 flex items-center"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => updateQty(ci.menuItemId, -ci.quantity)} className="text-[#727786] hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t border-[#c2c7d7] bg-white shrink-0">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>Impuestos (8%)</span><span>{formatCurrency(tax)}</span></div>
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-[#c2c7d7]"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>
              <button onClick={submitOrder} disabled={submitting} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-[8px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50">
                {submitting ? (
                  <><RefreshCw className="w-5 h-5 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="w-5 h-5" /> Enviar a Cocina — {formatCurrency(total)}</>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white p-4 border-t border-[#c2c7d7] lg:hidden sticky bottom-0 z-40">
        <button onClick={() => setShowMobileCart(true)} className="w-full bg-blue-900 text-white py-3 rounded-[8px] font-bold flex items-center justify-between px-4 shadow-md">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Ver Pedido ({totalItems})</span>
          </div>
          <span>{formatCurrency(total)}</span>
        </button>
      </footer>

      {noteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in" onClick={() => setNoteTarget(null)}>
          <div className="bg-white w-full max-w-sm rounded-[8px] p-5 border border-gray-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2"><ChefHat className="w-4 h-4 text-blue-900" /> Nota de preparación</h3>
            <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Ej: Término medio, Sin cebolla..." className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-[8px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-sm h-24 resize-none" />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setNoteTarget(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-[8px] font-medium transition-all text-sm">Cancelar</button>
              <button onClick={() => updateNotes(noteTarget, noteInput)} className="flex-1 py-2 bg-blue-900 text-white hover:bg-blue-800 rounded-[8px] font-bold transition-all text-sm">Agregar</button>
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
      <div className="min-h-dvh bg-[#eff4ff] flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago exitoso!</h2>
          <p className="text-gray-500">Mesa {table.label} liberada · {formatCurrency(grandTotal)}</p>
        </div>
      </div>
    )
  }

  if (loading) return <div className="min-h-dvh bg-[#eff4ff] flex items-center justify-center"><RefreshCw className="w-6 h-6 text-gray-400 animate-spin" /></div>

  return (
    <div className="min-h-dvh bg-[#eff4ff] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-3 px-4 lg:px-8 shrink-0">
        <button onClick={onBack} className="p-2 text-blue-900 hover:bg-[#eff4ff] rounded-full transition-colors -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Cobro — Mesa {table.label}</h2>
          <p className="text-xs text-gray-500">Revisa el consumo y procesa el pago</p>
        </div>
      </header>
      <div className="flex-1 p-4 lg:p-8 space-y-4 max-w-lg mx-auto w-full">
        <div className="bg-white border border-gray-200 rounded-[8px] p-5 space-y-3 shadow-sm">
          <div className="flex justify-between text-gray-600"><span className="text-sm">Subtotal</span><span className="font-medium">{bill ? formatCurrency(bill.subtotal) : '-'}</span></div>
          <div className="flex justify-between text-gray-500 text-sm"><span>IVA (8%)</span><span>{bill ? formatCurrency(bill.tax) : '-'}</span></div>
          <div className="border-t border-gray-200 pt-3 flex justify-between text-gray-900 font-bold text-lg"><span>Total consumo</span><span className="text-blue-900">{bill ? formatCurrency(bill.total) : '-'}</span></div>
        </div>

        <div>
          <p className="text-sm text-gray-700 mb-2 font-medium">Propina</p>
          <div className="flex gap-2">
            {[0, 10, 15, 20].map((pct) => (
              <button key={pct} onClick={() => setTipPct(pct)} className={`flex-1 py-3 rounded-[8px] text-sm font-medium border transition-all ${tipPct === pct ? 'bg-blue-900/10 border-blue-900 text-blue-900 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <div>{pct === 0 ? 'Sin' : `${pct}%`}</div>
                <div className="text-xs opacity-70">{formatCurrency(bill ? bill.total * pct / 100 : 0)}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-700 mb-2 font-medium">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {([['cash', 'Efectivo', Banknote], ['card', 'Tarjeta', CreditCard], ['digital_wallet', 'Digital', Smartphone]] as const).map(([val, label, Icon]) => (
              <button key={val} onClick={() => setMethod(val)} className={`flex flex-col items-center gap-1.5 py-4 rounded-[8px] border transition-all ${method === val ? 'bg-blue-900/10 border-blue-900 text-blue-900 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <Icon className="w-5 h-5" /><span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#eff4ff] border border-blue-900/20 rounded-[8px] p-5 text-center">
          <p className="text-sm text-gray-600">Total a cobrar</p>
          <p className="text-3xl font-black text-blue-900 mt-1 tabular-nums">{formatCurrency(grandTotal)}</p>
        </div>

        <button onClick={handlePayment} disabled={processing || !bill} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[8px] shadow-sm disabled:opacity-50 transition-all active:scale-[0.98]">
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
