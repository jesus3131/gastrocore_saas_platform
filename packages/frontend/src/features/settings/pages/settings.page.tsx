import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { Modal, ConfirmDialog, EmptyState, ErrorState } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { Save, CreditCard, RefreshCw, Eye, EyeOff } from 'lucide-react'

export function SettingsPage() {
  const [configForm, setConfigForm] = useState<any>(null)
  const [showSubModal, setShowSubModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: config, isLoading, error, refetch } = useQuery({
    queryKey: ['tenant', 'config'],
    queryFn: () => api.get('/tenants/config').then((r) => r.data.data),
  })

  const { data: features } = useQuery({
    queryKey: ['tenant', 'features'],
    queryFn: () => api.get('/tenants/features').then((r) => r.data.data),
  })

  const { data: subscription } = useQuery({
    queryKey: ['subscriptions', 'current'],
    queryFn: () => api.get('/subscriptions/current').then((r) => r.data.data),
  })

  const { data: plans } = useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: () => api.get('/subscriptions/plans').then((r) => r.data.data),
  })

  const { data: invoices } = useQuery({
    queryKey: ['subscriptions', 'invoices'],
    queryFn: () => api.get('/subscriptions/invoices').then((r) => r.data.data),
  })

  const updateConfig = useMutation({
    mutationFn: (data: any) => api.put('/tenants/config', data),
    onSuccess: () => { toast.success('Configuración actualizada'); queryClient.invalidateQueries({ queryKey: ['tenant'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const changePlan = useMutation({
    mutationFn: (data: any) => api.post('/subscriptions/change', data),
    onSuccess: () => { toast.success('Plan actualizado'); queryClient.invalidateQueries({ queryKey: ['subscriptions'] }); setShowSubModal(false) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar configuración" onRetry={refetch} />

  const currentPlan = plans?.find((p: any) => p.id === subscription?.planId)
  const featureList = features?.features || []

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Configuración</h1>
        <button onClick={() => { setConfigForm({ ...config }); refetch() }} className="btn-secondary btn-sm">
          <RefreshCw className="w-3 h-3" /> Recargar
        </button>
      </div>

      <div className="card space-y-4">
        <h3 className="card-title">Información del Negocio</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre del Restaurante</label>
            <input
              defaultValue={config?.name}
              onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
              className="input"
              placeholder="Mi Restaurante"
            />
          </div>
          <div>
            <label className="label">Tipo de Negocio</label>
            <input value={config?.businessType || ''} className="input" disabled />
          </div>
          <div>
            <label className="label">Moneda</label>
            <select
              defaultValue={config?.currency || 'MXN'}
              onChange={(e) => setConfigForm({ ...configForm, currency: e.target.value })}
              className="select"
            >
              <option value="MXN">MXN - Peso Mexicano</option>
              <option value="USD">USD - Dólar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="COP">COP - Peso Colombiano</option>
              <option value="ARS">ARS - Peso Argentino</option>
            </select>
          </div>
          <div>
            <label className="label">Zona Horaria</label>
            <select
              defaultValue={config?.timezone || 'America/Mexico_City'}
              onChange={(e) => setConfigForm({ ...configForm, timezone: e.target.value })}
              className="select"
            >
              <option value="America/Mexico_City">America/Mexico City (UTC-6)</option>
              <option value="America/Argentina/Buenos_Aires">Argentina (UTC-3)</option>
              <option value="America/Bogota">Colombia (UTC-5)</option>
              <option value="America/Lima">Perú (UTC-5)</option>
              <option value="America/Santiago">Chile (UTC-4)</option>
              <option value="America/New_York">New York (UTC-5)</option>
            </select>
          </div>
          <div>
            <label className="label">Locale</label>
            <select
              defaultValue={config?.locale || 'es-MX'}
              onChange={(e) => setConfigForm({ ...configForm, locale: e.target.value })}
              className="select"
            >
              <option value="es-MX">Español (México)</option>
              <option value="es-AR">Español (Argentina)</option>
              <option value="es-CO">Español (Colombia)</option>
              <option value="es-ES">Español (España)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
        </div>
        <button onClick={() => updateConfig.mutate(configForm)} disabled={updateConfig.isPending} className="btn-primary">
          <Save className="w-4 h-4" /> {updateConfig.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="card space-y-3">
        <div className="card-header">
          <h3 className="card-title">Feature Flags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {featureList.length > 0 ? (
            featureList.map((f: any) => (
              <span key={f.feature} className={`badge ${f.enabled ? 'badge-success' : 'badge-neutral'}`}>
                {f.feature.replace(/_/g, ' ')}
              </span>
            ))
          ) : (
            <p className="text-xs text-on-surface-muted">Sin feature flags configurados</p>
          )}
        </div>
      </div>

      <div className="card space-y-3">
        <div className="card-header">
          <h3 className="card-title">Suscripción</h3>
          <CreditCard className="w-4 h-4 text-on-surface-muted" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-2xs text-on-surface-muted">Plan Actual</p>
            <p className="text-sm font-bold text-on-surface capitalize">{currentPlan?.name || subscription?.planId || 'Básico'}</p>
          </div>
          <div>
            <p className="text-2xs text-on-surface-muted">Estado</p>
            <p className="text-sm font-semibold">
              <span className={`badge-${subscription?.status === 'active' ? 'success' : subscription?.status === 'trial' ? 'warning' : 'error'}`}>
                {subscription?.status || 'active'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-2xs text-on-surface-muted">Usuarios</p>
            <p className="text-sm font-semibold">{subscription?.maxUsers || currentPlan?.maxUsers || 3}</p>
          </div>
          <div>
            <p className="text-2xs text-on-surface-muted">Precio</p>
            <p className="text-sm font-semibold text-primary">${currentPlan?.priceMonthly || 49}/mes</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={() => setShowSubModal(true)} className="btn-secondary btn-sm">Cambiar Plan</button>
          <button onClick={() => setShowInvoiceModal(true)} className="btn-ghost btn-sm">Ver Facturas</button>
        </div>

        {currentPlan?.features && (
          <div className="mt-3 pt-3 border-t border-on-surface-muted/10">
            <p className="text-xs font-semibold text-on-surface mb-2">Características del Plan:</p>
            <div className="flex flex-wrap gap-1.5">
              {currentPlan.features.map((f: string) => (
                <span key={f} className="badge-info text-2xs">{f.replace(/_/g, ' ')}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={showSubModal} onClose={() => setShowSubModal(false)} title="Cambiar Plan" size="lg">
        <div className="space-y-4">
          {plans?.map((plan: any) => (
            <div
              key={plan.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                plan.id === subscription?.planId ? 'border-primary bg-primary/5' : 'border-on-surface-muted/10'
              }`}
              onClick={() => {
                if (plan.id !== subscription?.planId) {
                  changePlan.mutate({ planId: plan.id })
                }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-on-surface">{plan.name}</h4>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">${plan.priceMonthly}/mes</p>
                  <p className="text-2xs text-on-surface-muted">${plan.priceYearly}/año</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {plan.features?.map((f: string) => (
                  <span key={f} className="badge-neutral text-2xs">{f.replace(/_/g, ' ')}</span>
                ))}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-on-surface-muted">
                <span>↑ {plan.maxUsers} usuarios</span>
                <span>↑ {plan.maxBranches} sucursales</span>
                <span>{plan.storageGb} GB</span>
              </div>
              {plan.id === subscription?.planId && (
                <div className="mt-2">
                  <span className="badge-success">Plan Actual</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title="Historial de Facturas" size="lg">
        {invoices?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Folio</th><th>Fecha</th><th>Plan</th><th>Monto</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs">{inv.invoiceNumber || inv.id.slice(0, 8)}</td>
                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="capitalize">{inv.planId || inv.plan}</td>
                    <td className="font-semibold">${Number(inv.amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge-${inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'error'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Sin facturas" message="No hay historial de facturas disponible" />
        )}
      </Modal>
    </div>
  )
}
