import { useState, useEffect, useCallback, useRef } from 'react'
import { UtensilsCrossed, ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Search, Check, Circle, LogOut, CreditCard, Banknote, Smartphone, ChevronRight, ChefHat, ClipboardList, Receipt, X } from 'lucide-react'
import toast from 'react-hot-toast'

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Acceso Meseros</h1>
          <p className="text-slate-400 mt-1">GastroCore POS</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="mesero@restaurante.com" className="input w-full bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="input w-full bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function getTableColor(status: string) {
  switch (status) {
    case 'occupied': return 'border-amber-500/50 bg-amber-500/10 text-amber-300'
    case 'bill_requested': return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
    default: return 'border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500'
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

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tables`, { headers: getHeaders(state.token) })
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

  useEffect(() => { fetchTables(); const iv = setInterval(fetchTables, 15000); return () => clearInterval(iv) }, [fetchTables])

  const filtered = tables.filter((t) => t.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-amber-400" />
          <span className="text-white font-semibold">{state.user.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTables} className="text-slate-400 hover:text-white text-sm">{loading ? '...' : '⟳'}</button>
          <button onClick={() => { localStorage.removeItem('waiter_session'); localStorage.removeItem('waiter_tables'); window.location.reload() }} className="text-slate-400 hover:text-red-400"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>
      <div className="p-4 pb-24">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar mesa por número..." className="input w-full bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 pl-10 focus:border-amber-500" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {filtered.map((table) => (
            <button key={table.id} onClick={() => {
              if (table.status === 'available') onStartOrder(table)
              else if (table.activeOrder) onRequestBill(table)
            }} className={`relative flex flex-col items-center justify-center p-4 rounded-xl border ${getTableColor(table.status)} transition-all active:scale-95`}>
              {getStatusIcon(table.status)}
              <span className="text-lg font-bold mt-1">{table.label}</span>
              {table.activeOrder && <span className="text-xs mt-1 opacity-80">{formatCurrency(table.activeOrder.total)}</span>}
              {table.status === 'available' && <span className="text-xs mt-1">Libre</span>}
            </button>
          ))}
        </div>
      </div>
      <footer className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 px-4 py-3 flex justify-around text-xs text-slate-500">
        <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-amber-400 text-amber-400" /> Ocupada</span>
        <span className="flex items-center gap-1"><Receipt className="w-3 h-3 text-emerald-400" /> Cuenta</span>
        <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3 text-slate-400" /> Libre</span>
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
        tableId: table.id, type: 'dine_in', subtotal, tax, discount: 0, total, items: cart.map((ci) => ({ menuItemId: ci.menuItemId, name: ci.name, quantity: ci.quantity, unitPrice: ci.unitPrice, notes: ci.notes || undefined })),
      }
      const res = await fetch(`${API}/orders`, { method: 'POST', headers: getHeaders(state.token), body: JSON.stringify(payload) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message || 'Error al crear orden')
      toast.success('Comanda enviada a cocina')
      onBack()
    } catch (err: any) { toast.error(err.message) } finally { setSubmitting(false) }
  }

  const activeItems = categories.find((c) => c.id === activeCategory)?.items || []

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h2 className="text-white font-semibold">Mesa {table.label}</h2>
          <p className="text-xs text-slate-500">Nuevo pedido</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-slate-300">
          <ShoppingCart className="w-4 h-4 text-amber-400" />
          <span>{cart.reduce((s, ci) => s + ci.quantity, 0)}</span>
        </div>
      </header>
      <div className="flex gap-1 overflow-x-auto px-4 py-2 bg-slate-900/50 border-b border-slate-800 hide-scrollbar">
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{cat.name}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-48">
        {loading ? <p className="text-slate-500 text-center py-8">Cargando menú...</p> : activeItems.map((item) => (
          <div key={item.id} onClick={() => addItem(item)} className="flex items-center justify-between p-3 mb-2 rounded-xl bg-slate-800/50 border border-slate-700/50 active:scale-[0.98] transition-all cursor-pointer">
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{item.name}</p>
              {item.description && <p className="text-xs text-slate-500 truncate">{item.description}</p>}
              <p className="text-amber-400 font-semibold text-sm mt-0.5">{formatCurrency(item.price)}</p>
            </div>
            <Plus className="w-5 h-5 text-slate-400 flex-shrink-0 ml-2" />
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 rounded-t-2xl max-h-[50vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
            <span className="text-white font-semibold text-sm">Cuenta</span>
            <span className="text-amber-400 font-bold">{formatCurrency(total)}</span>
          </div>
          <div className="overflow-y-auto flex-1 px-4 py-2 space-y-2">
            {cart.map((ci) => (
              <div key={ci.menuItemId} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{ci.name}</p>
                  {ci.notes && <p className="text-xs text-slate-500 italic">"{ci.notes}"</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(ci.menuItemId, -1)} className="p-1 text-slate-400 hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="text-white font-medium text-sm w-6 text-center">{ci.quantity}</span>
                  <button onClick={() => updateQty(ci.menuItemId, 1)} className="p-1 text-slate-400 hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <span className="text-slate-300 text-sm w-16 text-right">{formatCurrency(ci.unitPrice * ci.quantity)}</span>
                <button onClick={() => { setNoteTarget(ci.menuItemId); setNoteInput(ci.notes) }} className="p-1 text-slate-500 hover:text-amber-400"><ChefHat className="w-3.5 h-3.5" /></button>
                <button onClick={() => updateQty(ci.menuItemId, -ci.quantity)} className="p-1 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-800">
            <button onClick={submitOrder} disabled={submitting} className="btn btn-primary w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold disabled:opacity-50">
              {submitting ? 'Enviando...' : `Enviar a cocina — ${formatCurrency(total)}`}
            </button>
          </div>
        </div>
      )}
      {noteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setNoteTarget(null)}>
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-3">Nota de preparación</h3>
            <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Ej: Término medio, Sin cebolla..." className="input w-full bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-24 resize-none" />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setNoteTarget(null)} className="btn flex-1 btn-ghost text-slate-300">Cancelar</button>
              <button onClick={() => updateNotes(noteTarget, noteInput)} className="btn flex-1 bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400">Agregar</button>
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
      toast.success(`Pago registrado — Mesa ${table.label} liberada`)
      onBack()
    } catch (err: any) { toast.error(err.message) } finally { setProcessing(false) }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-slate-500">Calculando cuenta...</p></div>

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h2 className="text-white font-semibold">Cobro — Mesa {table.label}</h2>
          <p className="text-xs text-slate-500">Revisa el consumo y procesa el pago</p>
        </div>
      </header>
      <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 space-y-3">
          <div className="flex justify-between text-slate-300"><span>Subtotal</span><span>{bill ? formatCurrency(bill.subtotal) : '-'}</span></div>
          <div className="flex justify-between text-slate-400 text-sm"><span>IVA (8%)</span><span>{bill ? formatCurrency(bill.tax) : '-'}</span></div>
          <div className="border-t border-slate-700 pt-2 flex justify-between text-white font-semibold text-lg"><span>Total consumo</span><span className="text-amber-400">{bill ? formatCurrency(bill.total) : '-'}</span></div>
        </div>
        <div>
          <p className="text-sm text-slate-400 mb-2">Propina</p>
          <div className="flex gap-2">
            {[0, 10, 15, 20].map((pct) => (
              <button key={pct} onClick={() => setTipPct(pct)} className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${tipPct === pct ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                {pct === 0 ? 'Sin' : `${pct}%`}<br /><span className="text-xs">{formatCurrency(bill ? bill.total * pct / 100 : 0)}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-400 mb-2">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {([['cash', 'Efectivo', Banknote], ['card', 'Tarjeta', CreditCard], ['digital_wallet', 'Digital', Smartphone]] as const).map(([val, label, Icon]) => (
              <button key={val} onClick={() => setMethod(val)} className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors ${method === val ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                <Icon className="w-5 h-5" /><span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-center">
          <p className="text-sm text-slate-400">Total a cobrar</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{formatCurrency(grandTotal)}</p>
        </div>
        <button onClick={handlePayment} disabled={processing || !bill} className="btn w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold disabled:opacity-50 text-base">
          {processing ? 'Procesando...' : `Cobrar ${formatCurrency(grandTotal)}`}
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
