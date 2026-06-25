import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'

export function SettingsPage() {
  const { data: config } = useQuery({
    queryKey: ['tenant', 'config'],
    queryFn: () => api.get('/tenants/config').then((r) => r.data.data),
  })

  const { data: features } = useQuery({
    queryKey: ['tenant', 'features'],
    queryFn: () => api.get('/tenants/features').then((r) => r.data.data),
  })

  const updateConfig = useMutation({
    mutationFn: (data: any) => api.put('/tenants/config', data),
    onSuccess: () => { toast.success('Configuración actualizada') },
  })

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-xl font-bold text-on-surface">Configuración</h1>

      <div className="card space-y-4">
        <h3 className="card-title">Información del Negocio</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre</label>
            <input defaultValue={config?.name} className="input" />
          </div>
          <div>
            <label className="label">Tipo de Negocio</label>
            <input value={config?.businessType || ''} className="input" disabled />
          </div>
          <div>
            <label className="label">Moneda</label>
            <select defaultValue={config?.currency || 'MXN'} className="select">
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label className="label">Zona Horaria</label>
            <input defaultValue={config?.timezone} className="input" />
          </div>
        </div>
        <button onClick={() => updateConfig.mutate({ name: config?.name })} className="btn-primary">Guardar Cambios</button>
      </div>

      <div className="card">
        <h3 className="card-title mb-3">Feature Flags Activados</h3>
        <div className="flex flex-wrap gap-2">
          {features?.features?.map((f: any) => (
            <span key={f.feature} className={`badge ${f.enabled ? 'badge-success' : 'badge-neutral'}`}>
              {f.feature.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title mb-3">Suscripción</h3>
        <p className="text-sm">Plan: <span className="font-semibold capitalize">{config?.subscriptionPlan || 'Básico'}</span></p>
        <p className="text-xs text-on-surface-muted">Estado: {config?.subscriptionStatus}</p>
      </div>
    </div>
  )
}
