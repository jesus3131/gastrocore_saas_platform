import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { Modal, EmptyState, ErrorState, MetricCard } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { Building2, Mail, Plus, RefreshCw } from 'lucide-react'

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
  { id: 'basic', name: 'Básico', price: '$49/mes' },
  { id: 'pro', name: 'Profesional', price: '$129/mes' },
  { id: 'enterprise', name: 'Enterprise', price: '$349/mes' },
]

export function SuperAdminPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [showCredentials, setShowCredentials] = useState<string | null>(null)
  const [lastCreated, setLastCreated] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: companies, isLoading, error, refetch } = useQuery({
    queryKey: ['super', 'companies'],
    queryFn: () => api.get('/super/companies').then((r) => r.data.data),
  })

  const [form, setForm] = useState({
    companyName: '',
    adminName: '',
    adminEmail: '',
    businessType: 'fine_dining',
    planId: 'basic',
  })

  const createCompany = useMutation({
    mutationFn: (data: typeof form) => api.post('/super/companies', data).then((r) => r.data.data),
    onSuccess: (data) => {
      setLastCreated(data)
      setShowCredentials(data.credentials?.password || '')
      toast.success('Empresa creada — credenciales enviadas por email')
      queryClient.invalidateQueries({ queryKey: ['super'] })
      setForm({ companyName: '', adminName: '', adminEmail: '', businessType: 'fine_dining', planId: 'basic' })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear'),
  })

  const resendCredentials = useMutation({
    mutationFn: (id: string) => api.post(`/super/companies/${id}/resend-credentials`).then((r) => r.data.data),
    onSuccess: () => toast.success('Credenciales re-enviadas por email'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState message="Error al cargar empresas" onRetry={refetch} />

  const totalCompanies = companies?.length || 0
  const activeCompanies = companies?.filter((c: any) => c.subscriptionStatus === 'active' || c.subscriptionStatus === 'trial').length || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Panel de Super Admin</h1>
          <p className="text-xs text-on-surface-muted">Gestión de empresas registradas en la plataforma</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="btn-secondary btn-sm">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setModalOpen(true)} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Nueva Empresa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard label="Total Empresas" value={totalCompanies} icon={Building2} color="text-primary bg-primary/10" />
        <MetricCard label="Activas" value={activeCompanies} icon={Building2} color="text-success bg-success/10" />
        <MetricCard label="Usuarios Prom." value={totalCompanies > 0 ? `${(companies!.reduce((s: number, c: any) => s + (c.userCount || 0), 0) / totalCompanies).toFixed(1)}` : '0'} icon={Building2} color="text-info bg-info/10" />
      </div>

      {lastCreated && showCredentials && (
        <div className="rounded-lg border border-success/30 bg-success/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface">Empresa Creada: {lastCreated.company?.name}</h3>
            <button onClick={() => { setShowCredentials(null); setLastCreated(null) }} className="btn-ghost btn-sm">Cerrar</button>
          </div>
          <p className="text-xs text-on-surface-muted">Las credenciales se enviaron a <strong>{lastCreated.admin?.email}</strong></p>
          <div className="flex items-center gap-3 p-2 rounded bg-surface-container">
            <div className="text-xs">
              <p><strong>Email:</strong> {lastCreated.credentials?.email}</p>
              <p><strong>Contraseña:</strong> <code className="bg-surface-container-high px-1.5 py-0.5 rounded text-xs font-mono">{showCredentials}</code></p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`${lastCreated.credentials?.email}\n${showCredentials}`); toast.success('Copiado') }} className="btn-ghost btn-xs">Copiar</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Empresas Registradas</h3>
        </div>
        {companies?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Admin</th>
                  <th>Plan</th>
                  <th>Estado</th>
                  <th>Usuarios</th>
                  <th>Moneda</th>
                  <th>Registro</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c: any) => (
                  <tr key={c.id}>
                    <td className="font-medium text-on-surface">{c.name}</td>
                    <td>
                      {c.admin ? (
                        <div className="text-xs">
                          <p className="font-medium">{c.admin.name}</p>
                          <p className="text-on-surface-muted">{c.admin.email}</p>
                        </div>
                      ) : <span className="text-on-surface-muted">—</span>}
                    </td>
                    <td className="capitalize">{c.subscriptionPlan}</td>
                    <td>
                      <span className={`badge-${c.subscriptionStatus === 'active' ? 'success' : c.subscriptionStatus === 'trial' ? 'warning' : 'error'}`}>
                        {c.subscriptionStatus}
                      </span>
                    </td>
                    <td className="text-center">{c.userCount}</td>
                    <td className="text-center font-mono text-xs">{c.currency}</td>
                    <td className="text-xs text-on-surface-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => resendCredentials.mutate(c.id)}
                        disabled={resendCredentials.isPending}
                        className="btn-ghost btn-sm p-1"
                        title="Re-enviar credenciales"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Sin empresas" message="No hay empresas registradas aún. Crea la primera empresa para comenzar." />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Nueva Empresa" size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Nombre de la Empresa</label>
            <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input" placeholder="Ej: La Cocina de Juan" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre del Administrador</label>
              <input value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} className="input" placeholder="Nombre completo" />
            </div>
            <div>
              <label className="label">Email del Administrador</label>
              <input type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} className="input" placeholder="admin@empresa.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de Negocio</label>
              <select value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} className="select">
                {businessTypes.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Plan de Suscripción</label>
              <select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className="select">
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs text-on-surface-muted">
              Al crear la empresa, se generará automáticamente un usuario administrador con credenciales
              únicas que serán enviadas al correo electrónico registrado. El sistema creará el plan
              seleccionado con todas sus funcionalidades.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancelar</button>
            <button
              onClick={() => createCompany.mutate(form)}
              disabled={!form.companyName || !form.adminName || !form.adminEmail || createCompany.isPending}
              className="btn-primary flex-1"
            >
              {createCompany.isPending ? 'Creando...' : 'Crear Empresa y Enviar Credenciales'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
