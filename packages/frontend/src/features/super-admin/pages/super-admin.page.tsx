import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { Modal, EmptyState, ErrorState, MetricCard, ConfirmDialog } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import {
  Building2, Eye, Mail, Plus, RefreshCw, Users,
  LayoutDashboard, Calendar, CreditCard, Shield,
  Search, X, Check, AlertTriangle, Filter,
  ChevronLeft, ChevronRight, Trash2, ToggleLeft,
  ToggleRight, Ban, CheckCircle, Clock,
  DollarSign, ShoppingCart, Layers, HeartPulse, Megaphone, Flag, Copy,
} from 'lucide-react'
import { SvgAreaChart, SvgBarChart, ArchitectureDiagram } from '../../../shared/components/charts/svg-charts'

// ─── CONSTANTS ────────────────────────────────────────────────

const businessTypes = [
  { value: 'fine_dining', label: 'Alta Cocina' },
  { value: 'fast_food', label: 'Fast Food' },
  { value: 'cafe', label: 'Cafetería' },
  { value: 'food_truck', label: 'Food Truck' },
  { value: 'bar', label: 'Bar' },
  { value: 'franchise', label: 'Franquicia' },
  { value: 'bakery', label: 'Panadería' },
  { value: 'ghost_kitchen', label: 'Cocina Oculta' },
]

const plans = [
  { id: 'basic', name: 'Básico', price: 49, priceYearly: 470, users: 3, branches: 1, transactions: 1000, storage: 5,
    features: ['pos', 'kds', 'table_management', 'split_bills'] },
  { id: 'pro', name: 'Profesional', price: 129, priceYearly: 1238, users: 15, branches: 3, transactions: 10000, storage: 50,
    features: ['pos', 'kds', 'table_management', 'split_bills', 'online_ordering', 'inventory_auto', 'hr_scheduling', 'electronic_invoice', 'delivery_integration', 'crm_full', 'analytics', 'accounting'] },
  { id: 'enterprise', name: 'Enterprise', price: 349, priceYearly: 3350, users: 999, branches: 999, transactions: 999999, storage: 500,
    features: ['pos', 'kds', 'table_management', 'split_bills', 'online_ordering', 'inventory_auto', 'hr_scheduling', 'electronic_invoice', 'delivery_integration', 'crm_full', 'bcg_matrix', 'loyalty_program', 'multi_branch', 'analytics', 'accounting'] },
]

const featureLabels: Record<string, string> = {
  pos: 'Punto de Venta', kds: 'Pantalla de Cocina', table_management: 'Mapa de Mesas',
  split_bills: 'División de Cuentas', online_ordering: 'Pedidos en Línea',
  inventory_auto: 'Inventario Automático', hr_scheduling: 'Gestión de Turnos',
  electronic_invoice: 'Facturación Electrónica', delivery_integration: 'Integración Delivery',
  crm_full: 'CRM Completo', analytics: 'Analíticas', accounting: 'Contabilidad',
  bcg_matrix: 'Matriz BCG', loyalty_program: 'Programa de Lealtad', multi_branch: 'Multi-sucursal',
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'companies', label: 'Empresas', icon: Building2 },
  { id: 'plans', label: 'Planes', icon: Layers },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'billing', label: 'Facturación', icon: CreditCard },
  { id: 'health', label: 'Sistema', icon: HeartPulse },
  { id: 'announcements', label: 'Anuncios', icon: Megaphone },
  { id: 'audit', label: 'Auditoría', icon: Shield },
  { id: 'features', label: 'Feature Flags', icon: Flag },
]

const eventCategories = [
  { value: 'maintenance', label: 'Mantenimiento', color: '#3b82f6' },
  { value: 'billing', label: 'Facturación', color: '#10b981' },
  { value: 'security', label: 'Seguridad', color: '#ef4444' },
  { value: 'meeting', label: 'Reunión', color: '#f59e0b' },
  { value: 'other', label: 'Otro', color: '#8b5cf6' },
]

const severityStyles: Record<string, string> = {
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  critical: 'badge-error',
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ─── MAIN COMPONENT ───────────────────────────────────────────

export function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const queryClient = useQueryClient()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Panel de Super Admin</h1>
          <p className="text-xs text-on-surface-muted">Gestión centralizada de la plataforma SaaS</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-on-surface-muted/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-muted hover:text-on-surface hover:border-on-surface-muted/30'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'companies' && <CompaniesTab />}
      {activeTab === 'calendar' && <CalendarTab />}
      {activeTab === 'billing' && <BillingTab />}
      {activeTab === 'plans' && <PlansTab />}
      {activeTab === 'health' && <HealthTab />}
      {activeTab === 'announcements' && <AnnouncementsTab />}
      {activeTab === 'audit' && <AuditTab />}
      {activeTab === 'features' && <FeatureFlagsTab />}
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────

function DashboardTab() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['super', 'dashboard'],
    queryFn: () => api.get('/super/dashboard').then((r) => r.data.data),
    refetchInterval: 30_000,
  })

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar dashboard" onRetry={refetch} />

  const planColors: Record<string, string> = { basic: 'bg-blue-500', pro: 'bg-amber-500', enterprise: 'bg-emerald-500' }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Empresas" value={data.totalTenants} icon={Building2} color="text-primary bg-primary/10" />
        <MetricCard label="Activas" value={data.activeTenants} icon={CheckCircle} color="text-success bg-success/10" />
        <MetricCard label="Suspendidas" value={data.suspendedTenants} icon={Ban} color="text-error bg-error/10" />
        <MetricCard label="Usuarios" value={data.totalUsers} icon={Users} color="text-info bg-info/10" />
        <MetricCard label="Órdenes" value={data.totalOrders} icon={ShoppingCart} color="text-warning bg-warning/10" />
        <MetricCard label="Ingresos" value={`$${data.totalRevenue?.toLocaleString() || '0'}`} icon={DollarSign} color="text-success bg-success/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Trend */}
        <div className="card lg:col-span-2">
          <div className="card-header"><h3 className="card-title">Tendencia MRR</h3></div>
          <div className="card-body">
            {data.mrrTrend?.length > 0 ? (
              <SvgAreaChart
                data={data.mrrTrend.map((m: any) => ({ label: m.month, value: m.mrr, secondary: m.transactions }))}
                color="#f59e0b"
                formatValue={(v) => `$${v.toLocaleString()}`}
              />
            ) : <p className="text-xs text-on-surface-muted">Sin datos de MRR</p>}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Distribución de Planes</h3></div>
          <div className="card-body">
            {data.planDistribution?.length > 0 ? (
              <SvgBarChart
                data={data.planDistribution.map((p: any) => ({ label: p.plan, value: p.count }))}
                color="#f59e0b"
                formatValue={(v) => `${v} empresas`}
                height={180}
              />
            ) : <p className="text-xs text-on-surface-muted">Sin datos</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="card lg:col-span-3">
          <div className="card-header"><h3 className="card-title">Actividad Reciente</h3></div>
          <div className="card-body">
            {data.recentActivity?.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.recentActivity.map((a: any) => (
                  <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg bg-surface-container/50">
                    <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${a.action?.includes('delete') || a.action?.includes('critical') ? 'bg-error' : a.action?.includes('create') ? 'bg-success' : 'bg-info'}`} />
                    <div className="min-w-0">
                      <p className="text-xs text-on-surface truncate">{a.message || a.action}</p>
                      <p className="text-2xs text-on-surface-muted">{a.adminName} · {new Date(a.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-on-surface-muted">Sin actividad reciente</p>}
          </div>
        </div>
      </div>

      {/* Architecture Diagram */}
      <ArchitectureDiagram />
    </div>
  )
}

// ─── COMPANIES ────────────────────────────────────────────────

function CompaniesTab() {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showCredentials, setShowCredentials] = useState<string | null>(null)
  const [lastCreated, setLastCreated] = useState<any>(null)
  const [migrateTarget, setMigrateTarget] = useState<any>(null)
  const [migratePlanId, setMigratePlanId] = useState('')
  const [credentialsModal, setCredentialsModal] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: companies, isLoading, error, refetch } = useQuery({
    queryKey: ['super', 'companies'],
    queryFn: () => api.get('/super/companies').then((r) => r.data.data),
  })

  const [form, setForm] = useState({
    companyName: '', adminName: '', adminEmail: '', businessType: 'fine_dining',
    planId: 'basic', taxId: '', address: '', phone: '',
  })

  const createCompany = useMutation({
    mutationFn: (data: typeof form) => api.post('/super/companies', data).then((r) => r.data.data),
    onSuccess: (data) => {
      setCredentialsModal(data)
      toast.success('Empresa creada — credenciales enviadas por email')
      queryClient.invalidateQueries({ queryKey: ['super'] })
      setForm({ companyName: '', adminName: '', adminEmail: '', businessType: 'fine_dining', planId: 'basic', taxId: '', address: '', phone: '' })
      setModalOpen(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear'),
  })

  const resendCredentials = useMutation({
    mutationFn: (id: string) => api.post(`/super/companies/${id}/resend-credentials`).then((r) => r.data.data),
    onSuccess: () => toast.success('Credenciales re-enviadas por email'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const deleteCompany = useMutation({
    mutationFn: (id: string) => api.delete(`/super/companies/${id}`, { data: { confirmation: 'ELIMINAR' } }).then((r) => r.data.data),
    onSuccess: () => {
      toast.success('Empresa eliminada permanentemente')
      queryClient.invalidateQueries({ queryKey: ['super'] })
      setDeleteTarget(null); setDeleteConfirm('')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al eliminar'),
  })

  const toggleStatus = useMutation({
    mutationFn: (id: string) => api.post(`/super/companies/${id}/toggle-status`).then((r) => r.data.data),
    onSuccess: (data) => {
      toast.success(`Empresa ${data.status === 'active' ? 'activada' : 'suspendida'}`)
      queryClient.invalidateQueries({ queryKey: ['super'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const migratePlan = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) => api.post(`/super/companies/${id}/migrate-plan`, { planId: plan }).then((r) => r.data.data),
    onSuccess: () => {
      toast.success('Plan migrado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['super'] })
      setMigrateTarget(null)
      setMigratePlanId('')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al migrar plan'),
  })

  const filtered = useMemo(() => {
    if (!companies) return []
    return companies.filter((c: any) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.admin?.name?.toLowerCase().includes(search.toLowerCase()) || c.admin?.email?.toLowerCase().includes(search.toLowerCase())
      const matchPlan = !planFilter || c.subscriptionPlan === planFilter
      return matchSearch && matchPlan
    })
  }, [companies, search, planFilter])

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState message="Error al cargar empresas" onRetry={refetch} />

  const totalCompanies = companies?.length || 0
  const activeCompanies = companies?.filter((c: any) => c.subscriptionStatus === 'active' || c.subscriptionStatus === 'trial').length || 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <MetricCard label="Total" value={totalCompanies} icon={Building2} color="text-primary bg-primary/10" />
        <MetricCard label="Activas" value={activeCompanies} icon={CheckCircle} color="text-success bg-success/10" />
        <MetricCard label="Suspendidas" value={totalCompanies - activeCompanies} icon={Ban} color="text-error bg-error/10" />
        <MetricCard label="Usuarios Prom." value={totalCompanies > 0 ? (companies!.reduce((s: number, c: any) => s + (c.userCount || 0), 0) / totalCompanies).toFixed(1) : '0'} icon={Users} color="text-info bg-info/10" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between w-full gap-4">
            <h3 className="card-title shrink-0">Empresas</h3>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-muted" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-8 text-xs h-8" placeholder="Buscar por nombre, admin o email..." />
              </div>
              <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="select text-xs h-8 w-28">
                <option value="">Todos</option>
                <option value="basic">Básico</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <button onClick={() => refetch()} className="btn-secondary btn-sm p-1.5"><RefreshCw className="w-3.5 h-3.5" /></button>
              <button onClick={() => setModalOpen(true)} className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5" /> Nueva</button>
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Admin</th>
                  <th>Plan</th>
                  <th>Estado</th>
                  <th>Usuarios</th>
                  <th>Registro</th>
                  <th className="w-32">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any) => (
                  <tr key={c.id}>
                    <td className="font-medium text-on-surface">
                      <Link to={`/super-admin/companies/${c.id}`} className="hover:text-primary transition-colors">{c.name}</Link>
                    </td>
                    <td>
                      {c.admin ? (
                        <div className="text-xs"><p className="font-medium">{c.admin.name}</p><p className="text-on-surface-muted">{c.admin.email}</p></div>
                      ) : <span className="text-on-surface-muted">—</span>}
                    </td>
                    <td className="capitalize text-xs font-medium">{c.subscriptionPlan}</td>
                    <td>
                      <span className={`badge-${c.subscriptionStatus === 'active' ? 'success' : c.subscriptionStatus === 'trial' ? 'warning' : 'error'} text-2xs`}>
                        {c.subscriptionStatus}
                      </span>
                    </td>
                    <td className="text-center text-xs">{c.userCount}</td>
                    <td className="text-2xs text-on-surface-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link to={`/super-admin/companies/${c.id}`} className="btn-ghost btn-sm p-1" title="Detalle"><Eye className="w-3.5 h-3.5" /></Link>
                        <button onClick={() => toggleStatus.mutate(c.id)} disabled={toggleStatus.isPending} className="btn-ghost btn-sm p-1" title={c.subscriptionStatus === 'active' ? 'Suspender' : 'Activar'}>
                          {c.subscriptionStatus === 'active' ? <ToggleRight className="w-3.5 h-3.5 text-success" /> : <ToggleLeft className="w-3.5 h-3.5 text-on-surface-muted" />}
                        </button>
                        <button onClick={() => { setMigrateTarget(c); setMigratePlanId(c.subscriptionPlan) }} className="btn-ghost btn-sm p-1" title="Migrar Plan"><Layers className="w-3.5 h-3.5" /></button>
                        <button onClick={() => resendCredentials.mutate(c.id)} disabled={resendCredentials.isPending} className="btn-ghost btn-sm p-1" title="Re-enviar credenciales"><Mail className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setDeleteTarget(c); setDeleteConfirm('') }} className="btn-ghost btn-sm p-1 text-error" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={search || planFilter ? 'Sin resultados' : 'Sin empresas'} message={search || planFilter ? 'Intenta con otros filtros' : 'Crea la primera empresa para comenzar.'} />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Nueva Empresa" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre de la Empresa *</label>
              <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input" placeholder="Ej: La Cocina de Juan" />
            </div>
            <div><label className="label">NIT / RUT</label><input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="input" placeholder="NIT o RUT" /></div>
            <div><label className="label">Teléfono</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+52 555 123 4567" /></div>
            <div className="col-span-2"><label className="label">Dirección</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" placeholder="Dirección del restaurante" /></div>
          </div>
          <div className="border-t border-on-surface-muted/10 pt-4">
            <h4 className="text-sm font-bold text-on-surface mb-3">Datos del Administrador</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Nombre *</label><input value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} className="input" placeholder="Nombre completo" /></div>
              <div><label className="label">Email *</label><input type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} className="input" placeholder="admin@empresa.com" /></div>
            </div>
          </div>
          <div className="border-t border-on-surface-muted/10 pt-4">
            <label className="label">Tipo de Negocio</label>
            <select value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} className="select">
              {businessTypes.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
            </select>
          </div>
          <div className="border-t border-on-surface-muted/10 pt-4">
            <label className="label">Plan de Suscripción</label>
            <div className="grid grid-cols-3 gap-3">
              {plans.map((plan) => {
                const selected = form.planId === plan.id
                return (
                  <div key={plan.id} onClick={() => setForm({ ...form, planId: plan.id })}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-on-surface-muted/10 hover:border-on-surface-muted/30'}`}>
                    <p className="text-sm font-bold text-on-surface">{plan.name}</p>
                    <p className="text-lg font-bold text-primary">${plan.price}<span className="text-xs text-on-surface-muted font-normal">/mes</span></p>
                    <p className="text-2xs text-on-surface-muted">${plan.priceYearly}/año</p>
                    <div className="mt-2 space-y-0.5 text-2xs text-on-surface-muted">
                      <p>↑ {plan.users} usuarios · ↑ {plan.branches} suc.</p>
                      <p>↑ {plan.transactions.toLocaleString()} trans./mes</p>
                      <p>{plan.storage} GB almacenamiento</p>
                    </div>
                    {selected && (
                      <div className="mt-2 pt-2 border-t border-primary/20">
                        <p className="text-2xs font-semibold text-primary mb-1">Incluye:</p>
                        <div className="space-y-0.5">
                          {plan.features.map((f) => (
                            <p key={f} className="text-2xs text-on-surface flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 text-success" />
                              {featureLabels[f] || f}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={() => createCompany.mutate(form)} disabled={!form.companyName || !form.adminName || !form.adminEmail || createCompany.isPending} className="btn-primary flex-1">
              {createCompany.isPending ? 'Creando...' : 'Crear Empresa'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Migrate Plan Modal */}
      <Modal open={!!migrateTarget} onClose={() => { setMigrateTarget(null); setMigratePlanId('') }} title={`Migrar Plan: ${migrateTarget?.name || ''}`} size="lg">
        <div className="space-y-4">
          <p className="text-xs text-on-surface-muted">
            Plan actual: <strong className="capitalize text-on-surface">{migrateTarget?.subscriptionPlan}</strong>
          </p>
          <div className="grid grid-cols-3 gap-3">
            {plans.map((plan) => {
              const selected = migratePlanId === plan.id
              const isCurrent = migrateTarget?.subscriptionPlan === plan.id
              return (
                <div
                  key={plan.id}
                  onClick={() => !isCurrent && setMigratePlanId(plan.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${isCurrent ? 'border-on-surface-muted/20 bg-surface-container/30 opacity-60 cursor-not-allowed' : selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-on-surface-muted/10 hover:border-on-surface-muted/30'}`}
                >
                  <p className="text-sm font-bold text-on-surface">{plan.name}</p>
                  <p className="text-lg font-bold text-primary">${plan.price}<span className="text-xs text-on-surface-muted font-normal">/mes</span></p>
                  <div className="mt-2 space-y-1 text-2xs text-on-surface-muted">
                    <p className="flex justify-between"><span>Usuarios</span><span className="font-medium text-on-surface">{plan.users}</span></p>
                    <p className="flex justify-between"><span>Sucursales</span><span className="font-medium text-on-surface">{plan.branches === 999 ? '∞' : plan.branches}</span></p>
                    <p className="flex justify-between"><span>Transacciones</span><span className="font-medium text-on-surface">{plan.transactions.toLocaleString()}/mes</span></p>
                    <p className="flex justify-between"><span>Almacenamiento</span><span className="font-medium text-on-surface">{plan.storage} GB</span></p>
                  </div>
                  {isCurrent && <p className="text-2xs text-primary mt-2 font-medium">Plan actual</p>}
                  {selected && !isCurrent && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <div className="space-y-0.5">
                        {plan.features.map((f) => (
                          <p key={f} className="text-2xs text-on-surface flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 text-success shrink-0" />
                            {featureLabels[f] || f}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => { setMigrateTarget(null); setMigratePlanId('') }} className="btn-secondary flex-1">Cancelar</button>
            <button
              onClick={() => migratePlan.mutate({ id: migrateTarget.id, plan: migratePlanId })}
              disabled={!migratePlanId || migratePlanId === migrateTarget?.subscriptionPlan || migratePlan.isPending}
              className="btn-primary flex-1"
            >
              {migratePlan.isPending ? 'Migrando...' : `Migrar a ${plans.find((p) => p.id === migratePlanId)?.name || ''}`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeleteConfirm('') }} title={`Eliminar ${deleteTarget?.name || ''}`} size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-error/5 border border-error/20">
            <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-on-surface">Esta acción es irreversible</p>
              <p className="text-xs text-on-surface-muted mt-1">Se eliminarán todos los datos asociados a esta empresa incluyendo usuarios, órdenes, inventario y configuraciones.</p>
            </div>
          </div>
          <div>
            <label className="label">Escribe <strong>ELIMINAR</strong> para confirmar</label>
            <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} className="input text-center font-mono text-sm" placeholder="ELIMINAR" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setDeleteTarget(null); setDeleteConfirm('') }} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={() => deleteCompany.mutate(deleteTarget.id)} disabled={deleteConfirm !== 'ELIMINAR' || deleteCompany.isPending} className="btn-danger flex-1">
              {deleteCompany.isPending ? 'Eliminando...' : 'Eliminar Permanentemente'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Credentials Modal */}
      <Modal open={!!credentialsModal} onClose={() => setCredentialsModal(null)} title={`Empresa Creada: ${credentialsModal?.company?.name || ''}`} size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
            <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-on-surface">Credenciales enviadas por email</p>
              <p className="text-xs text-on-surface-muted mt-1">Las credenciales se enviaron a <strong>{credentialsModal?.admin?.email}</strong></p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface-container space-y-2">
            <div>
              <p className="text-2xs text-on-surface-muted mb-1">Email</p>
              <div className="flex items-center justify-between bg-surface-container-high rounded px-2 py-1.5">
                <code className="text-xs font-mono text-on-surface">{credentialsModal?.credentials?.email}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(credentialsModal?.credentials?.email || ''); toast.success('Email copiado') }}
                  className="btn-ghost btn-xs p-0.5 text-on-surface-muted hover:text-primary"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-2xs text-on-surface-muted mb-1">Contraseña</p>
              <div className="flex items-center justify-between bg-surface-container-high rounded px-2 py-1.5">
                <code className="text-xs font-mono text-on-surface">{credentialsModal?.credentials?.password}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(credentialsModal?.credentials?.password || ''); toast.success('Contraseña copiada') }}
                  className="btn-ghost btn-xs p-0.5 text-on-surface-muted hover:text-primary"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(`${credentialsModal?.credentials?.email}\n${credentialsModal?.credentials?.password}`); toast.success('Credenciales copiadas') }}
            className="btn-primary w-full text-xs"
          >
            <Copy className="w-3.5 h-3.5" /> Copiar Todo
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ─── CALENDAR ─────────────────────────────────────────────────

function CalendarTab() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: '', description: '', category: 'other', eventDate: '', startTime: '', endTime: '', color: '#f59e0b', allDay: false, tenantId: '',
  })

  const queryClient = useQueryClient()

  const monthStart = new Date(currentYear, currentMonth, 1)
  const monthEnd = new Date(currentYear, currentMonth + 1, 0)

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['super', 'calendar', currentYear, currentMonth],
    queryFn: () => api.get(`/super/calendar?dateFrom=${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01&dateTo=${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${monthEnd.getDate()}`).then((r) => r.data.data),
  })

  const { data: companies } = useQuery({
    queryKey: ['super', 'companies'],
    queryFn: () => api.get('/super/companies').then((r) => r.data.data),
  })

  const createEvent = useMutation({
    mutationFn: (data: typeof eventForm) => api.post('/super/calendar', data).then((r) => r.data.data),
    onSuccess: () => {
      toast.success('Evento creado')
      queryClient.invalidateQueries({ queryKey: ['super', 'calendar'] })
      setShowEventForm(false)
      setEventForm({ title: '', description: '', category: 'other', eventDate: '', startTime: '', endTime: '', color: '#f59e0b', allDay: false, tenantId: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear evento'),
  })

  const deleteEvent = useMutation({
    mutationFn: (id: string) => api.delete(`/super/calendar/${id}`).then((r) => r.data.data),
    onSuccess: () => {
      toast.success('Evento eliminado')
      queryClient.invalidateQueries({ queryKey: ['super', 'calendar'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) } else setCurrentMonth(currentMonth - 1) }
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) } else setCurrentMonth(currentMonth + 1) }

  const daysInMonth = monthEnd.getDate()
  const startDay = monthStart.getDay()
  const calendarDays: (number | null)[] = Array(startDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)
  while (calendarDays.length % 7 !== 0) calendarDays.push(null)

  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {}
    if (!events) return map
    events.forEach((ev: any) => {
      const key = new Date(ev.eventDate).toISOString().split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(ev)
    })
    return map
  }, [events])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title">{MONTHS[currentMonth]} {currentYear}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => { const n = new Date(); setCurrentMonth(n.getMonth()); setCurrentYear(n.getFullYear()) }} className="btn-ghost btn-xs">Hoy</button>
              <button onClick={prevMonth} className="btn-ghost btn-sm p-1"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={nextMonth} className="btn-ghost btn-sm p-1"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="grid grid-cols-7 border-b border-on-surface-muted/10">
            {DAYS.map((d) => <div key={d} className="p-2 text-center text-2xs font-medium text-on-surface-muted">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} className="min-h-24 p-1 bg-surface-container/30" />
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayEvents = eventsByDate[dateStr] || []
              const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear
              const isSelected = selectedDate === dateStr

              return (
                <div
                  key={i}
                  onClick={() => { setSelectedDate(dateStr); setEventForm({ ...eventForm, eventDate: dateStr }) }}
                  className={`min-h-24 p-1 border-b border-r border-on-surface-muted/5 cursor-pointer transition-colors hover:bg-surface-container/50 ${isToday ? 'bg-primary/5' : ''} ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${isToday ? 'bg-primary text-white font-bold' : 'text-on-surface'}`}>{day}</span>
                  <div className="space-y-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((ev: any) => (
                      <div key={ev.id} className="group relative flex items-center gap-1 px-1 py-0.5 rounded text-2xs truncate" style={{ backgroundColor: ev.color + '20', color: ev.color }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                        <span className="truncate">{ev.title}</span>
                        <button onClick={(e) => { e.stopPropagation(); if (confirm('¿Eliminar evento?')) deleteEvent.mutate(ev.id) }} className="ml-auto hidden group-hover:flex shrink-0"><X className="w-2.5 h-2.5" /></button>
                      </div>
                    ))}
                    {dayEvents.length > 3 && <span className="text-2xs text-on-surface-muted pl-1">+{dayEvents.length - 3} más</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Nuevo Evento</h3></div>
          <div className="card-body space-y-3">
            <div>
              <label className="label">Título *</label>
              <input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="input text-xs" placeholder="Título del evento" />
            </div>
            <div>
              <label className="label">Fecha</label>
              <input type="date" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} className="input text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label">Inicio</label><input type="time" value={eventForm.startTime} onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })} className="input text-xs" /></div>
              <div><label className="label">Fin</label><input type="time" value={eventForm.endTime} onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })} className="input text-xs" /></div>
            </div>
            <div>
              <label className="label">Categoría</label>
              <select value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value, color: eventCategories.find((ec) => ec.value === e.target.value)?.color || '#f59e0b' })} className="select text-xs">
                {eventCategories.map((ec) => <option key={ec.value} value={ec.value}>{ec.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Empresa (opcional)</label>
              <select value={eventForm.tenantId} onChange={(e) => setEventForm({ ...eventForm, tenantId: e.target.value })} className="select text-xs">
                <option value="">Todas las empresas</option>
                {(companies || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={eventForm.allDay} onChange={(e) => setEventForm({ ...eventForm, allDay: e.target.checked })} className="accent-primary" />
              <span className="text-xs text-on-surface">Todo el día</span>
            </div>
            <button onClick={() => createEvent.mutate(eventForm)} disabled={!eventForm.title || !eventForm.eventDate || createEvent.isPending} className="btn-primary btn-sm w-full text-xs">
              {createEvent.isPending ? 'Creando...' : 'Crear Evento'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Leyenda</h3></div>
          <div className="card-body space-y-2">
            {eventCategories.map((ec) => (
              <div key={ec.value} className="flex items-center gap-2 text-xs text-on-surface">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ec.color }} />
                {ec.label}
              </div>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</h3></div>
            <div className="card-body">
              {(eventsByDate[selectedDate]?.length || 0) > 0 ? (
                <div className="space-y-2">
                  {eventsByDate[selectedDate].map((ev: any) => (
                    <div key={ev.id} className="flex items-start gap-2 p-2 rounded-lg bg-surface-container/50">
                      <span className="w-2 h-2 mt-1 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-on-surface">{ev.title}</p>
                        <p className="text-2xs text-on-surface-muted">{ev.startTime || 'Todo el día'} · {ev.tenantName || 'General'}</p>
                      </div>
                      <button onClick={() => deleteEvent.mutate(ev.id)} className="btn-ghost btn-xs p-0.5 text-error"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-on-surface-muted">Sin eventos este día</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── BILLING ──────────────────────────────────────────────────

function BillingTab() {
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({ tenantId: '', description: '', amount: 0, dueDate: '', currency: 'MXN' })
  const queryClient = useQueryClient()

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['super', 'invoices', statusFilter],
    queryFn: () => api.get(`/super/invoices${statusFilter ? `?status=${statusFilter}` : ''}`).then((r) => r.data.data),
  })

  const { data: companies } = useQuery({
    queryKey: ['super', 'companies'],
    queryFn: () => api.get('/super/companies').then((r) => r.data.data),
  })

  const markPaid = useMutation({
    mutationFn: (id: string) => api.put(`/super/invoices/${id}/mark-paid`, {}).then((r) => r.data.data),
    onSuccess: () => { toast.success('Factura marcada como pagada'); queryClient.invalidateQueries({ queryKey: ['super', 'invoices'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const createInvoice = useMutation({
    mutationFn: (data: typeof invoiceForm) => api.post('/super/invoices', data).then((r) => r.data.data),
    onSuccess: () => { toast.success('Factura creada'); queryClient.invalidateQueries({ queryKey: ['super', 'invoices'] }); setShowCreateInvoice(false); setInvoiceForm({ tenantId: '', description: '', amount: 0, dueDate: '', currency: 'MXN' }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  if (isLoading) return <LoadingSkeleton rows={6} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select text-xs h-8">
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="paid">Pagadas</option>
            <option value="failed">Fallidas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
        <button onClick={() => setShowCreateInvoice(true)} className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5" /> Nueva Factura</button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Historial de Facturación</h3></div>
        {invoices?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Vencimiento</th>
                  <th>Pago</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="text-xs font-medium text-on-surface">{inv.tenantName || inv.tenantId?.slice(0, 8)}</td>
                    <td className="text-xs text-on-surface-muted max-w-48 truncate">{inv.description}</td>
                    <td className="text-xs font-mono font-bold">{inv.amount?.toFixed(2)} {inv.currency}</td>
                    <td>
                      <span className={`badge-${inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'error'} text-2xs`}>{inv.status}</span>
                    </td>
                    <td className="text-2xs text-on-surface-muted">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="text-2xs text-on-surface-muted">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'}</td>
                    <td>
                      {inv.status === 'pending' && (
                        <button onClick={() => markPaid.mutate(inv.id)} disabled={markPaid.isPending} className="btn-primary btn-xs text-2xs">Marcar Pagada</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="Sin facturas" message="No hay facturas registradas." />}
      </div>

      <Modal open={showCreateInvoice} onClose={() => setShowCreateInvoice(false)} title="Nueva Factura Manual" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Empresa *</label>
            <select value={invoiceForm.tenantId} onChange={(e) => setInvoiceForm({ ...invoiceForm, tenantId: e.target.value })} className="select">
              <option value="">Seleccionar empresa</option>
              {(companies || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Descripción *</label>
            <input value={invoiceForm.description} onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })} className="input" placeholder="Ej: Factura mensual Julio 2026" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Monto *</label>
              <input type="number" step="0.01" min="0" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: parseFloat(e.target.value) || 0 })} className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="label">Moneda</label>
              <select value={invoiceForm.currency} onChange={(e) => setInvoiceForm({ ...invoiceForm, currency: e.target.value })} className="select">
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Fecha de Vencimiento *</label>
            <input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} className="input" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowCreateInvoice(false)} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={() => createInvoice.mutate(invoiceForm)} disabled={!invoiceForm.tenantId || !invoiceForm.description || !invoiceForm.amount || !invoiceForm.dueDate || createInvoice.isPending} className="btn-primary flex-1">
              {createInvoice.isPending ? 'Creando...' : 'Crear Factura'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── PLANS ────────────────────────────────────────────────────

function PlansTab() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const planCards = plans.map((p) => {
    const isExpanded = expanded === p.id
    return (
      <div key={p.id} className="card overflow-hidden">
        <div className="card-header">
          <div className="flex items-center justify-between w-full">
            <h3 className="card-title text-lg">{p.name}</h3>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">${p.price}<span className="text-sm text-on-surface-muted font-normal">/mes</span></p>
              <p className="text-xs text-on-surface-muted">${p.priceYearly}/año ({Math.round((1 - p.priceYearly / (p.price * 12)) * 100)}% ahorro)</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-surface-container/50 text-center">
              <p className="text-2xl font-bold text-on-surface">{p.users}</p>
              <p className="text-2xs text-on-surface-muted">Usuarios máx.</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container/50 text-center">
              <p className="text-2xl font-bold text-on-surface">{p.branches}</p>
              <p className="text-2xs text-on-surface-muted">{p.branches === 999 ? 'Ilimitadas' : 'Sucursales'}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container/50 text-center">
              <p className="text-2xl font-bold text-on-surface">{p.transactions.toLocaleString()}</p>
              <p className="text-2xs text-on-surface-muted">Trans./mes</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container/50 text-center">
              <p className="text-2xl font-bold text-on-surface">{p.storage} GB</p>
              <p className="text-2xs text-on-surface-muted">Almacenamiento</p>
            </div>
          </div>

          <button onClick={() => setExpanded(isExpanded ? null : p.id)} className="btn-ghost btn-xs text-primary">
            {isExpanded ? 'Ocultar' : 'Ver'} módulos incluidos ({p.features.length})
          </button>

          {isExpanded && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {p.features.map((f) => (
                <div key={f} className="flex items-center gap-2 p-2 rounded-lg bg-surface-container/30 text-xs">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  <span className="text-on-surface">{featureLabels[f] || f}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  })

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header"><h3 className="card-title">Planes de Suscripción</h3></div>
        <div className="card-body">
          <p className="text-xs text-on-surface-muted mb-4">Comparativa detallada de todos los planes disponibles para empresas.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{planCards}</div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Tabla Comparativa</h3></div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Característica</th>
                {plans.map((p) => <th key={p.id} className="text-center capitalize">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {['pos', 'kds', 'table_management', 'split_bills', 'online_ordering', 'inventory_auto', 'hr_scheduling', 'electronic_invoice', 'delivery_integration', 'crm_full', 'analytics', 'accounting', 'bcg_matrix', 'loyalty_program', 'multi_branch'].map((feature) => (
                <tr key={feature}>
                  <td className="text-xs text-on-surface">{featureLabels[feature] || feature}</td>
                  {plans.map((p) => (
                    <td key={p.id} className="text-center">
                      {p.features.includes(feature)
                        ? <Check className="w-4 h-4 text-success mx-auto" />
                        : <X className="w-4 h-4 text-on-surface-muted/50 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t-2 border-on-surface-muted/20">
                <td className="text-xs font-bold text-on-surface">Precio Mensual</td>
                {plans.map((p) => <td key={p.id} className="text-center text-sm font-bold text-primary">${p.price}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── SYSTEM HEALTH ────────────────────────────────────────────

function HealthTab() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['super', 'health'],
    queryFn: () => api.get('/super/health').then((r) => r.data.data),
    refetchInterval: 30_000,
  })

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar salud del sistema" onRetry={refetch} />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${data.overall === 'healthy' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          {data.overall === 'healthy' ? <CheckCircle className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
          <span className="text-sm font-bold capitalize">{data.overall === 'healthy' ? 'Saludable' : data.overall === 'degraded' ? 'Degradado' : 'Caído'}</span>
        </div>
        <button onClick={() => refetch()} className="btn-ghost btn-sm p-1.5"><RefreshCw className="w-3.5 h-3.5" /></button>
        <span className="text-2xs text-on-surface-muted">Última actualización: {new Date(data.timestamp).toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(data.checks || {}).map(([service, status]) => {
          const healthy = status === 'healthy'
          return (
            <div key={service} className="card">
              <div className="card-body flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${healthy ? 'bg-success/10' : 'bg-error/10'}`}>
                  {healthy ? <CheckCircle className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-error" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface capitalize">{service}</p>
                  <p className={`text-xs ${healthy ? 'text-success' : 'text-error'}`}>{healthy ? 'Saludable' : 'Caído'}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────

function AnnouncementsTab() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('info')
  const [audience, setAudience] = useState('all')
  const queryClient = useQueryClient()

  const { data: logs } = useQuery({
    queryKey: ['super', 'audit-logs', 'announcement'],
    queryFn: () => api.get('/super/audit-logs?action=announcement.create').then((r) => r.data.data),
  })

  const createAnnouncement = useMutation({
    mutationFn: (data: { title: string; message: string; severity: string; audience: string }) =>
      api.post('/super/announcements', data).then((r) => r.data.data),
    onSuccess: () => {
      toast.success('Anuncio enviado a todos los tenants')
      setTitle(''); setMessage(''); setSeverity('info'); setAudience('all')
      queryClient.invalidateQueries({ queryKey: ['super', 'audit-logs', 'announcement'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear anuncio'),
  })

  const announcements = logs?.logs?.filter((l: any) => l.action === 'announcement.create') || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 card">
        <div className="card-header"><h3 className="card-title">Nuevo Anuncio</h3></div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Ej: Mantenimiento programado" />
          </div>
          <div>
            <label className="label">Mensaje *</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input min-h-[100px] resize-y" placeholder="Describe el anuncio..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Severidad</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="select">
                <option value="info">Informativo</option>
                <option value="warning">Advertencia</option>
                <option value="success">Éxito</option>
                <option value="critical">Crítico</option>
              </select>
            </div>
            <div>
              <label className="label">Audiencia</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="select">
                <option value="all">Todos los tenants</option>
                <option value="basic">Solo plan Básico</option>
                <option value="pro">Solo plan Pro</option>
                <option value="enterprise">Solo Enterprise</option>
              </select>
            </div>
          </div>
          <button onClick={() => createAnnouncement.mutate({ title, message, severity, audience })}
            disabled={!title || !message || createAnnouncement.isPending}
            className="btn-primary w-full">
            {createAnnouncement.isPending ? 'Enviando...' : 'Enviar Anuncio'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-3 card">
        <div className="card-header"><h3 className="card-title">Historial de Anuncios</h3></div>
        <div className="card-body">
          {announcements.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {announcements.map((a: any) => {
                const meta = a.metadata || {}
                return (
                  <div key={a.id} className={`p-3 rounded-lg border-l-4 ${a.severity === 'critical' ? 'border-l-error bg-error/5' : a.severity === 'warning' ? 'border-l-warning bg-warning/5' : a.severity === 'success' ? 'border-l-success bg-success/5' : 'border-l-info bg-info/5'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-on-surface">{meta.title || a.message}</p>
                        <p className="text-xs text-on-surface-muted mt-1">{a.message}</p>
                      </div>
                      <span className={`badge-${a.severity === 'critical' ? 'error' : a.severity === 'warning' ? 'warning' : a.severity === 'success' ? 'success' : 'info'} text-2xs capitalize shrink-0`}>
                        {a.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-2xs text-on-surface-muted">
                      <span>{a.adminName}</span>
                      <span>·</span>
                      <span>Audiencia: {a.message?.startsWith('[') ? a.message.split(']')[0].replace('[', '') : 'all'}</span>
                      <span>·</span>
                      <span>{new Date(a.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState title="Sin anuncios" message="Crea el primer anuncio global para todos los tenants." />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── AUDIT ────────────────────────────────────────────────────

// ─── FEATURE FLAGS ─────────────────────────────────────────────

function FeatureFlagsTab() {
  const queryClient = useQueryClient()

  const featureDescriptions: Record<string, string> = {
    kds: 'Pantalla de Cocina — Comandas en tiempo real',
    online_ordering: 'Pedidos en Línea — Recepción web/app',
    bcg_matrix: 'Matriz BCG — Análisis estratégico de menú',
    loyalty_program: 'Programa de Lealtad — Puntos y recompensas',
    multi_branch: 'Multi-sucursal — Gestión de múltiples locales',
    inventory_auto: 'Inventario Automático — Deducción por comanda',
    hr_scheduling: 'Gestión de Turnos — Programación de personal',
    crm_full: 'CRM Completo — Segmentación y campañas',
    delivery_integration: 'Integración Delivery — Rappi, Uber, DiDi',
    table_management: 'Mapa de Mesas — Disposición interactiva',
    split_bills: 'División de Cuentas — Pago por comensal',
    electronic_invoice: 'Facturación Electrónica — CFDI/XML',
    pos: 'Punto de Venta (POS) — Cashier interface',
    analytics: 'Analíticas — Reportes y métricas avanzadas',
    accounting: 'Contabilidad — Libro diario y balance',
  }

  const { data: flags, isLoading, error, refetch } = useQuery({
    queryKey: ['super', 'features'],
    queryFn: () => api.get('/super/features').then((r) => r.data.data),
  })

  const updateFlag = useMutation({
    mutationFn: (data: { feature: string; enabled: boolean }) =>
      api.put('/super/features', data).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['super', 'features'] }),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al actualizar'),
  })

  const toggleAll = useMutation({
    mutationFn: (enabled: boolean) =>
      api.put('/super/features/toggle-all', { enabled }).then((r) => r.data.data),
    onSuccess: (data) => {
      toast.success(data.enabled ? 'Todos los features activados' : 'Todos los features desactivados')
      queryClient.invalidateQueries({ queryKey: ['super', 'features'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar feature flags" onRetry={refetch} />

  const activeCount = flags?.filter((f: any) => f.enabled).length || 0
  const totalCount = flags?.length || 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-on-surface">Control Global de Features</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => toggleAll.mutate(true)} disabled={toggleAll.isPending} className="btn-primary btn-xs text-2xs">
            <Check className="w-3 h-3" /> {toggleAll.isPending ? '...' : 'Activar Todos'}
          </button>
          <button onClick={() => toggleAll.mutate(false)} disabled={toggleAll.isPending} className="btn-secondary btn-xs text-2xs">
            <X className="w-3 h-3" /> {toggleAll.isPending ? '...' : 'Desactivar Todos'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {flags?.map((flag: any) => (
          <div
            key={flag.feature}
            className={`card cursor-pointer transition-all hover:shadow-md ${flag.enabled ? 'ring-1 ring-success/30' : 'opacity-60'}`}
            onClick={() => updateFlag.mutate({ feature: flag.feature, enabled: !flag.enabled })}
          >
            <div className="card-body flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${flag.enabled ? 'bg-success/10' : 'bg-surface-container'}`}>
                {flag.enabled ? <Check className="w-5 h-5 text-success" /> : <X className="w-5 h-5 text-on-surface-muted" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-on-surface">{featureLabels[flag.feature] || flag.feature}</p>
                <p className="text-2xs text-on-surface-muted truncate">{featureDescriptions[flag.feature] || ''}</p>
              </div>
              <div className={`relative w-10 h-5 rounded-full transition-colors ${flag.enabled ? 'bg-success' : 'bg-on-surface-muted/30'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${flag.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Resumen de Features</h3></div>
        <div className="card-body">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-surface-container/50 text-center">
              <p className="text-2xl font-bold text-on-surface">{activeCount}</p>
              <p className="text-2xs text-on-surface-muted">Activos</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container/50 text-center">
              <p className="text-2xl font-bold text-on-surface">{totalCount - activeCount}</p>
              <p className="text-2xs text-on-surface-muted">Inactivos</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container/50 text-center">
              <p className="text-2xl font-bold text-on-surface">{totalCount}</p>
              <p className="text-2xs text-on-surface-muted">Totales</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container/50 text-center">
              <p className="text-2xl font-bold text-on-surface">{totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%</p>
              <p className="text-2xs text-on-surface-muted">Cobertura</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── AUDIT ────────────────────────────────────────────────────

function AuditTab() {
  const [severityFilter, setSeverityFilter] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['super', 'audit-logs', severityFilter],
    queryFn: () => api.get(`/super/audit-logs${severityFilter ? `?severity=${severityFilter}` : ''}`).then((r) => r.data.data),
    refetchInterval: 15_000,
  })

  const clearFilter = () => setSeverityFilter('')

  if (isLoading) return <LoadingSkeleton rows={8} />

  const logs = data?.logs || []
  const total = data?.total || 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-on-surface-muted" />
          {['', 'info', 'success', 'warning', 'critical'].map((s) => (
            <button key={s} onClick={() => s === severityFilter ? clearFilter() : setSeverityFilter(s)}
              className={`btn-xs text-2xs px-2 py-1 rounded-full border transition-colors ${
                severityFilter === s ? 'bg-primary/10 border-primary text-primary' : 'border-on-surface-muted/20 text-on-surface-muted hover:border-on-surface-muted/50'
              }`}
            >
              {s || 'Todos'}
            </button>
          ))}
        </div>
        <span className="text-2xs text-on-surface-muted">{total} registros</span>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Consola de Auditoría</h3></div>
        {logs.length > 0 ? (
          <div className="table-container max-h-[500px] overflow-y-auto">
            <table>
              <thead className="sticky top-0 bg-surface z-10">
                <tr>
                  <th>Admin</th>
                  <th>Acción</th>
                  <th>Mensaje</th>
                  <th>Severidad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="text-xs">
                      <p className="font-medium text-on-surface">{log.adminName}</p>
                      {log.adminEmail && <p className="text-2xs text-on-surface-muted">{log.adminEmail}</p>}
                    </td>
                    <td className="text-2xs font-mono text-on-surface-muted">{log.action}</td>
                    <td className="text-xs text-on-surface max-w-64 truncate">{log.message}</td>
                    <td><span className={`${severityStyles[log.severity] || 'badge-info'} text-2xs`}>{log.severity}</span></td>
                    <td className="text-2xs text-on-surface-muted whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={severityFilter ? 'Sin resultados' : 'Sin registros de auditoría'} message={severityFilter ? `No hay logs con severidad "${severityFilter}"` : 'Las acciones de super admin se registrarán aquí automáticamente.'} />
        )}
      </div>
    </div>
  )
}