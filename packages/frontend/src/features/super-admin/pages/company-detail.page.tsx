import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { ErrorState } from '../../../shared/components/ui'
import { ArrowLeft, Check, X } from 'lucide-react'

const FEATURE_LABELS: Record<string, string> = {
  pos: 'POS (Punto de Venta)',
  kds: 'KDS - Sistema de Cocina',
  online_ordering: 'Pedidos en Línea',
  bcg_matrix: 'Matriz BCG de Menú',
  loyalty_program: 'Programa de Lealtad',
  multi_branch: 'Multi-sucursal',
  inventory_auto: 'Inventario Automático',
  hr_scheduling: 'Gestión de Turnos',
  crm_full: 'CRM Completo',
  delivery_integration: 'Integración con Delivery',
  table_management: 'Gestión de Mesas',
  split_bills: 'División de Cuentas',
  electronic_invoice: 'Facturación Electrónica',
  analytics: 'Analítica de Negocio',
  accounting: 'Contabilidad',
}

const ALL_FEATURES = Object.keys(FEATURE_LABELS)

const ALL_PLANS = [
  { id: 'basic', name: 'Básico', users: 3, branches: 1 },
  { id: 'pro', name: 'Profesional', users: 15, branches: 3 },
  { id: 'enterprise', name: 'Enterprise', users: 999, branches: 999 },
]

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [savingModules, setSavingModules] = useState(false)

  const { data: company, isLoading, error, refetch } = useQuery({
    queryKey: ['super', 'company', id],
    queryFn: () => api.get(`/super/companies/${id}`).then((r) => r.data.data),
    enabled: !!id,
  })

  const [form, setForm] = useState<any>(null)

  const updateCompany = useMutation({
    mutationFn: (data: any) => api.put(`/super/companies/${id}`, data).then((r) => r.data.data),
    onSuccess: () => {
      toast.success('Empresa actualizada')
      queryClient.invalidateQueries({ queryKey: ['super', 'company', id] })
      queryClient.invalidateQueries({ queryKey: ['super', 'companies'] })
      setEditing(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al actualizar'),
  })

  const updateModules = useMutation({
    mutationFn: (features: { feature: string; enabled: boolean }[]) => api.put(`/super/companies/${id}/modules`, { features }).then((r) => r.data.data),
    onSuccess: () => {
      toast.success('Módulos actualizados')
      queryClient.invalidateQueries({ queryKey: ['super', 'company', id] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al actualizar módulos'),
  })

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState message="Error al cargar empresa" onRetry={refetch} />

  const featureFlags = company?.featureFlags || []
  const enabledFeatures = featureFlags.filter((f: any) => f.enabled).map((f: any) => f.feature)
  const planInfo = ALL_PLANS.find((p) => p.id === company.subscriptionPlan)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/super-admin" className="btn-ghost btn-sm p-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-on-surface">{company.name}</h1>
          <p className="text-xs text-on-surface-muted">Detalle y configuración de la empresa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Section */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="card-title">Información General</h3>
            <button onClick={() => { setForm({ companyName: company.name, taxId: company.taxId || '', phone: company.phone || '', address: company.address || '' }); setEditing(!editing) }} className="btn-ghost btn-xs">
              {editing ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          <div className="card-body space-y-3">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Nombre</label>
                  <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">NIT / RUT</label>
                    <input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="input" placeholder="NIT o RUT" />
                  </div>
                  <div>
                    <label className="label">Teléfono</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="Teléfono" />
                  </div>
                </div>
                <div>
                  <label className="label">Dirección</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" placeholder="Dirección" />
                </div>
                <button onClick={() => updateCompany.mutate(form)} disabled={updateCompany.isPending} className="btn-primary btn-sm">
                  {updateCompany.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-on-surface-muted">NIT / RUT</p>
                    <p className="text-on-surface">{company.taxId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-muted">Teléfono</p>
                    <p className="text-on-surface">{company.phone || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-on-surface-muted">Dirección</p>
                    <p className="text-on-surface">{company.address || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-muted">Tipo de Negocio</p>
                    <p className="capitalize text-on-surface">{company.businessType?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-muted">Moneda</p>
                    <p className="text-on-surface">{company.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-muted">Miembros</p>
                    <p className="text-on-surface">{company._count?.users || 0} usuarios</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-muted">Sucursales</p>
                    <p className="text-on-surface">{company._count?.branches || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-muted">Órdenes</p>
                    <p className="text-on-surface">{company._count?.orders || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-muted">Clientes</p>
                    <p className="text-on-surface">{company._count?.customers || 0}</p>
                  </div>
                </div>
                <div className="text-xs text-on-surface-muted">
                  Creada: {new Date(company.createdAt).toLocaleDateString()}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Plan Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Plan Actual</h3>
          </div>
          <div className="card-body space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface capitalize">{planInfo?.name || company.subscriptionPlan}</p>
                <span className={`badge-${company.subscriptionStatus === 'active' ? 'success' : company.subscriptionStatus === 'trial' ? 'warning' : 'error'} text-xs`}>
                  {company.subscriptionStatus}
                </span>
              </div>
              <div className="text-right text-xs text-on-surface-muted">
                <p>↑ {planInfo?.users || 0} usuarios</p>
                <p>↑ {planInfo?.branches || 0} sucursales</p>
              </div>
            </div>

            <div className="border-t border-on-surface-muted/10 pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-on-surface">Usuarios Extra</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-muted">
                    Plan: {planInfo?.users || 0}
                    {company.extraUsers > 0 && <span className="text-success"> +{company.extraUsers} extra</span>}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form?.extraUsers ?? company.extraUsers ?? 0}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0)
                      setForm({ ...form, extraUsers: val })
                    }}
                    className="input w-20 text-xs text-center"
                    placeholder="0"
                  />
                  <button
                    onClick={() => updateCompany.mutate({ extraUsers: form?.extraUsers ?? company.extraUsers ?? 0 })}
                    disabled={updateCompany.isPending}
                    className="btn-primary btn-xs"
                  >
                    Vender
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-on-surface-muted/10 pt-3">
              <p className="text-xs font-bold text-on-surface mb-2">Cambiar Plan</p>
              <div className="grid grid-cols-3 gap-2">
                {ALL_PLANS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => updateCompany.mutate({ planId: p.id })}
                    disabled={updateCompany.isPending || p.id === company.subscriptionPlan}
                    className={`btn-sm text-xs ${p.id === company.subscriptionPlan ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules / Features Section */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="card-title">Módulos y Permisos</h3>
          <button
            onClick={async () => {
              setSavingModules(true)
              try {
                const currentFlags = featureFlags.map((f: any) => ({ feature: f.feature, enabled: f.enabled }))
                await updateModules.mutateAsync(currentFlags)
              } finally {
                setSavingModules(false)
              }
            }}
            disabled={savingModules}
            className="btn-primary btn-xs"
          >
            {savingModules ? 'Guardando...' : 'Guardar Módulos'}
          </button>
        </div>
        <div className="card-body">
          <p className="text-xs text-on-surface-muted mb-3">Activa o desactiva módulos para esta empresa. Los módulos del plan base vienen pre-seleccionados.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {ALL_FEATURES.map((feature) => {
              const flag = featureFlags.find((f: any) => f.feature === feature)
              const enabled = flag?.enabled ?? false
              return (
                <div
                  key={feature}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                    enabled ? 'border-success/30 bg-success/5' : 'border-on-surface-muted/10 bg-surface-container'
                  }`}
                  onClick={() => {
                    const newFlags = featureFlags.map((f: any) =>
                      f.feature === feature ? { ...f, enabled: !enabled } : f
                    )
                    if (!newFlags.find((f: any) => f.feature === feature)) {
                      newFlags.push({ feature, enabled: true })
                    }
                    queryClient.setQueryData(['super', 'company', id], {
                      ...company,
                      featureFlags: newFlags,
                    })
                  }}
                >
                  <span className="text-xs text-on-surface font-medium">{FEATURE_LABELS[feature] || feature}</span>
                  {enabled ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <X className="w-4 h-4 text-on-surface-muted" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}