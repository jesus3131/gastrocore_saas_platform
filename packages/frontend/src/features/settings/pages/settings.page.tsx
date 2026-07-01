import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { Modal, ConfirmDialog, EmptyState, ErrorState } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { Save, CreditCard, RefreshCw, Check, Minus, Info } from 'lucide-react'

const FEATURE_LABELS: Record<string, string> = {
  pos: 'POS (Punto de Venta)',
  kds: 'KDS (Cocina)',
  table_management: 'Mapa de Mesas',
  split_bills: 'Split de cuentas',
  online_ordering: 'Pedidos en línea',
  inventory_auto: 'Inventario',
  hr_scheduling: 'RRHH',
  crm_full: 'CRM',
  analytics: 'Analítica',
  accounting: 'Contabilidad',
  electronic_invoice: 'Facturación electrónica',
  delivery_integration: 'Integración delivery',
  bcg_matrix: 'BCG Matrix',
  loyalty_program: 'Loyalty Program',
  multi_branch: 'Multi-sucursal',
}

const PLAN_FEATURES_MATRIX: Record<string, { basic: boolean; pro: boolean; enterprise: boolean }> = {
  pos: { basic: true, pro: true, enterprise: true },
  table_management: { basic: true, pro: true, enterprise: true },
  split_bills: { basic: true, pro: true, enterprise: true },
  kds: { basic: true, pro: true, enterprise: true },
  inventory_auto: { basic: false, pro: true, enterprise: true },
  hr_scheduling: { basic: false, pro: true, enterprise: true },
  electronic_invoice: { basic: false, pro: true, enterprise: true },
  delivery_integration: { basic: false, pro: true, enterprise: true },
  crm_full: { basic: false, pro: true, enterprise: true },
  online_ordering: { basic: false, pro: true, enterprise: true },
  analytics: { basic: false, pro: true, enterprise: true },
  accounting: { basic: false, pro: true, enterprise: true },
  bcg_matrix: { basic: false, pro: false, enterprise: true },
  loyalty_program: { basic: false, pro: false, enterprise: true },
  multi_branch: { basic: false, pro: false, enterprise: true },
}

const PLAN_IDS = ['basic', 'pro', 'enterprise'] as const

const PLAN_LABELS: Record<string, string> = { basic: 'Básico', pro: 'Pro', enterprise: 'Enterprise' }
const PLAN_PRICES: Record<string, string> = { basic: '$49/mes', pro: '$129/mes', enterprise: '$349/mes' }

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

  const currentPlanId = subscription?.plan?.id || subscription?.currentPlan?.subscriptionPlan || 'basic'
  const hasExtraUsers = (subscription?.extraUsers || 0) > 0
  const totalUsers = (subscription?.plan?.maxUsers || 0) + (subscription?.extraUsers || 0)
  const featureList = features?.features || []

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
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
                {FEATURE_LABELS[f.feature] || f.feature.replace(/_/g, ' ')}
              </span>
            ))
          ) : (
            <p className="text-xs text-on-surface-muted">Sin feature flags configurados</p>
          )}
        </div>
      </div>

      <div className="card space-y-3">
        <div className="card-header">
          <h3 className="card-title">Plan Actual</h3>
          <CreditCard className="w-4 h-4 text-on-surface-muted" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-on-surface-muted/10">
                <th className="text-left py-2 pr-4 text-xs text-on-surface-muted font-medium">Característica</th>
                {PLAN_IDS.map((pid) => (
                  <th key={pid} className={`py-2 px-3 text-center text-xs font-bold ${pid === currentPlanId ? 'text-primary' : 'text-on-surface-muted'}`}>
                    {PLAN_LABELS[pid]}
                    <span className="block text-2xs font-normal">{PLAN_PRICES[pid]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-on-surface-muted/5">
                <td className="py-2 pr-4 text-xs text-on-surface font-medium">Usuarios</td>
                {PLAN_IDS.map((pid) => (
                  <td key={pid} className={`py-2 px-3 text-center text-xs ${pid === currentPlanId ? 'font-bold text-primary' : 'text-on-surface-muted'}`}>
                    {pid === 'basic' ? '3' : pid === 'pro' ? '15' : '∞'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-on-surface-muted/5">
                <td className="py-2 pr-4 text-xs text-on-surface font-medium">Sucursales</td>
                {PLAN_IDS.map((pid) => (
                  <td key={pid} className={`py-2 px-3 text-center text-xs ${pid === currentPlanId ? 'font-bold text-primary' : 'text-on-surface-muted'}`}>
                    {pid === 'basic' ? '1' : pid === 'pro' ? '3' : '∞'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-on-surface-muted/5">
                <td className="py-2 pr-4 text-xs text-on-surface font-medium">Transacciones/mes</td>
                {PLAN_IDS.map((pid) => (
                  <td key={pid} className={`py-2 px-3 text-center text-xs ${pid === currentPlanId ? 'font-bold text-primary' : 'text-on-surface-muted'}`}>
                    {pid === 'basic' ? '1,000' : pid === 'pro' ? '10,000' : '∞'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-on-surface-muted/5">
                <td className="py-2 pr-4 text-xs text-on-surface font-medium">Almacenamiento</td>
                {PLAN_IDS.map((pid) => (
                  <td key={pid} className={`py-2 px-3 text-center text-xs ${pid === currentPlanId ? 'font-bold text-primary' : 'text-on-surface-muted'}`}>
                    {pid === 'basic' ? '5 GB' : pid === 'pro' ? '50 GB' : '500 GB'}
                  </td>
                ))}
              </tr>
              {Object.entries(PLAN_FEATURES_MATRIX).map(([feature, matrix]) => (
                <tr key={feature} className="border-b border-on-surface-muted/5 last:border-0">
                  <td className="py-2 pr-4 text-xs text-on-surface">{FEATURE_LABELS[feature] || feature}</td>
                  {PLAN_IDS.map((pid) => (
                    <td key={pid} className="py-2 px-3 text-center">
                      {matrix[pid as keyof typeof matrix] ? (
                        <Check className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <Minus className="w-4 h-4 text-on-surface-muted/40 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div>
            <p className="text-sm font-bold text-on-surface">
              {PLAN_LABELS[currentPlanId]} — {PLAN_PRICES[currentPlanId]}
            </p>
            <p className="text-xs text-on-surface-muted">
              {totalUsers} usuarios disponibles
              {hasExtraUsers && <span className="text-success ml-1">(+{subscription?.extraUsers} extra)</span>}
              {' · '}Plan {subscription?.subscription?.status || 'activo'}
            </p>
          </div>
          <button onClick={() => setShowSubModal(true)} className="btn-primary btn-sm">
            Cambiar Plan
          </button>
        </div>

        <button onClick={() => setShowInvoiceModal(true)} className="btn-ghost btn-sm self-start">
          Ver Facturas
        </button>
      </div>

      <Modal open={showSubModal} onClose={() => setShowSubModal(false)} title="Comparar Planes" size="xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-on-surface-muted/10">
                <th className="text-left py-3 pr-4 text-xs text-on-surface-muted font-medium">Característica</th>
                {PLAN_IDS.map((pid) => (
                  <th key={pid} className={`py-3 px-4 text-center ${pid === currentPlanId ? 'bg-primary/5' : ''}`}>
                    <div className={`text-sm font-bold ${pid === currentPlanId ? 'text-primary' : 'text-on-surface'}`}>{PLAN_LABELS[pid]}</div>
                    <div className="text-lg font-bold text-primary">{PLAN_PRICES[pid]}</div>
                    {pid === currentPlanId && <span className="badge-success text-2xs mt-1">Actual</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-on-surface-muted/5">
                <td className="py-2.5 pr-4 text-xs font-medium text-on-surface">Usuarios</td>
                {PLAN_IDS.map((pid) => (
                  <td key={pid} className={`py-2.5 px-4 text-center text-xs ${pid === currentPlanId ? 'bg-primary/5 font-bold' : ''}`}>
                    {pid === 'basic' ? '3' : pid === 'pro' ? '15' : '∞'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-on-surface-muted/5">
                <td className="py-2.5 pr-4 text-xs font-medium text-on-surface">Sucursales</td>
                {PLAN_IDS.map((pid) => (
                  <td key={pid} className={`py-2.5 px-4 text-center text-xs ${pid === currentPlanId ? 'bg-primary/5 font-bold' : ''}`}>
                    {pid === 'basic' ? '1' : pid === 'pro' ? '3' : '∞'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-on-surface-muted/5">
                <td className="py-2.5 pr-4 text-xs font-medium text-on-surface">Transacciones/mes</td>
                {PLAN_IDS.map((pid) => (
                  <td key={pid} className={`py-2.5 px-4 text-center text-xs ${pid === currentPlanId ? 'bg-primary/5 font-bold' : ''}`}>
                    {pid === 'basic' ? '1,000' : pid === 'pro' ? '10,000' : '∞'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-on-surface-muted/5">
                <td className="py-2.5 pr-4 text-xs font-medium text-on-surface">Almacenamiento</td>
                {PLAN_IDS.map((pid) => (
                  <td key={pid} className={`py-2.5 px-4 text-center text-xs ${pid === currentPlanId ? 'bg-primary/5 font-bold' : ''}`}>
                    {pid === 'basic' ? '5 GB' : pid === 'pro' ? '50 GB' : '500 GB'}
                  </td>
                ))}
              </tr>
              {Object.entries(PLAN_FEATURES_MATRIX).map(([feature, matrix]) => (
                <tr key={feature} className="border-b border-on-surface-muted/5 last:border-0">
                  <td className="py-2.5 pr-4 text-xs text-on-surface">{FEATURE_LABELS[feature] || feature}</td>
                  {PLAN_IDS.map((pid) => (
                    <td key={pid} className={`py-2.5 px-4 text-center ${pid === currentPlanId ? 'bg-primary/5' : ''}`}>
                      {matrix[pid as keyof typeof matrix] ? (
                        <Check className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <Minus className="w-4 h-4 text-on-surface-muted/40 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-4">
          {PLAN_IDS.filter((pid) => pid !== currentPlanId).map((pid) => (
            <button
              key={pid}
              onClick={() => changePlan.mutate({ planId: pid })}
              disabled={changePlan.isPending}
              className="btn-primary flex-1 text-sm"
            >
              {changePlan.isPending ? 'Cambiando...' : `Cambiar a ${PLAN_LABELS[pid]}`}
            </button>
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
