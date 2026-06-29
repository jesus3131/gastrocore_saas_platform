import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, Store, Table2, Puzzle, Rocket, Plus, Trash2 } from 'lucide-react'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../app/store/auth.store'

const steps = [
  { id: 'profile', label: 'Perfil', icon: Store },
  { id: 'areas', label: 'Áreas y Mesas', icon: Table2 },
  { id: 'modules', label: 'Módulos', icon: Puzzle },
  { id: 'launch', label: 'Lanzamiento', icon: Rocket },
]

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

const allModules = [
  { id: 'kds', label: 'Kitchen Display System' },
  { id: 'online_ordering', label: 'Ordenes en Línea' },
  { id: 'inventory_auto', label: 'Inventario Automático' },
  { id: 'hr_scheduling', label: 'Gestión de Turnos' },
  { id: 'crm_full', label: 'CRM Completo' },
  { id: 'loyalty_program', label: 'Programa de Lealtad' },
  { id: 'bcg_matrix', label: 'Matriz BCG' },
  { id: 'delivery_integration', label: 'Integración Delivery' },
  { id: 'multi_branch', label: 'Multi-Sucursal' },
  { id: 'table_management', label: 'Gestión de Mesas' },
  { id: 'split_bills', label: 'División de Cuentas' },
  { id: 'electronic_invoice', label: 'Facturación Electrónica' },
]

export function OnboardingPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()

  const [profile, setProfile] = useState({ name: '', businessType: 'fine_dining', locale: 'es-MX', timezone: 'America/Mexico_City', currency: 'MXN' })
  const [areas, setAreas] = useState([{ name: 'Salón Principal', type: 'dining', tables: [{ label: 'M1', capacity: 2 }, { label: 'M2', capacity: 4 }] }])
  const [features, setFeatures] = useState<string[]>([])

  const addArea = () => setAreas([...areas, { name: `Área ${areas.length + 1}`, type: 'dining', tables: [] }])
  const removeArea = (i: number) => setAreas(areas.filter((_, idx) => idx !== i))
  const addTable = (areaIdx: number) => {
    const updated = [...areas]
    const tableNum = updated[areaIdx].tables.length + 1
    updated[areaIdx].tables.push({ label: `M${tableNum}`, capacity: 2 })
    setAreas(updated)
  }

  const saveProfile = useMutation({
    mutationFn: () => api.post('/onboarding/profile', profile),
    onSuccess: () => { setStep(1); toast.success('Perfil guardado') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const saveAreas = useMutation({
    mutationFn: () => api.post('/onboarding/areas', { branches: [{ name: profile.name || 'Sucursal Principal', areas }] }),
    onSuccess: () => { setStep(2); toast.success('Áreas y mesas configuradas') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const saveModules = useMutation({
    mutationFn: () => api.post('/onboarding/modules', { features: features.map((f) => ({ feature: f, enabled: true })) }),
    onSuccess: () => { setStep(3); toast.success('Módulos activados') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const doLaunch = useMutation({
    mutationFn: () => api.post('/onboarding/launch'),
    onSuccess: () => {
      toast.success('¡Sistema listo para usar!')
      if (user) updateUser({ ...user, onboardingCompleted: true })
      navigate('/dashboard')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  return (
    <div className="min-h-screen bg-surface-container flex flex-col">
      <div className="bg-surface border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i <= step ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-muted'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${i <= step ? 'text-primary' : 'text-on-surface-muted'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-on-surface-muted/20'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {step === 0 && (
            <div className="card space-y-4">
              <h2 className="text-lg font-bold">Perfil del Negocio</h2>
              <div>
                <label className="label">Nombre del Restaurante</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input"
                  placeholder="Ej: La Cocina de María"
                />
              </div>
              <div>
                <label className="label">Tipo de Negocio</label>
                <select value={profile.businessType} onChange={(e) => setProfile({ ...profile, businessType: e.target.value })} className="select">
                  {businessTypes.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Moneda</label>
                  <select value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value })} className="select">
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar</option>
                    <option value="COP">COP - Peso Colombiano</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="BRL">BRL - Real Brasileño</option>
                    <option value="ARS">ARS - Peso Argentino</option>
                  </select>
                </div>
                <div>
                  <label className="label">Zona Horaria</label>
                  <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} className="select">
                    <option value="America/Mexico_City">CDMX (UTC-6)</option>
                    <option value="America/Argentina/Buenos_Aires">Arg (UTC-3)</option>
                    <option value="America/Bogota">Col (UTC-5)</option>
                  </select>
                </div>
              </div>
              <button onClick={() => saveProfile.mutate()} disabled={!profile.name || saveProfile.isPending} className="btn-primary w-full">
                {saveProfile.isPending ? 'Guardando...' : 'Continuar'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="card space-y-4">
              <h2 className="text-lg font-bold">Áreas y Mesas</h2>
              <p className="text-xs text-on-surface-muted">Configura las áreas de tu restaurante y sus mesas</p>

              {areas.map((area, i) => (
                <div key={i} className="p-3 rounded-lg border border-on-surface-muted/10">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      value={area.name}
                      onChange={(e) => { const a = [...areas]; a[i].name = e.target.value; setAreas(a) }}
                      className="input text-sm flex-1 mr-2"
                      placeholder="Nombre del área"
                    />
                    <div className="flex gap-1">
                      <select
                        value={area.type}
                        onChange={(e) => { const a = [...areas]; a[i].type = e.target.value; setAreas(a) }}
                        className="select text-xs w-24"
                      >
                        <option value="dining">Comedor</option>
                        <option value="terrace">Terraza</option>
                        <option value="bar">Barra</option>
                        <option value="vip">VIP</option>
                        <option value="outdoor">Exterior</option>
                      </select>
                      {areas.length > 1 && (
                        <button onClick={() => removeArea(i)} className="btn-ghost btn-sm p-1 text-error">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {area.tables.map((table, ti) => (
                      <span key={ti} className="badge-neutral text-2xs">{table.label} ({table.capacity}p)</span>
                    ))}
                  </div>
                  <button onClick={() => addTable(i)} className="btn-ghost btn-sm text-xs w-full">
                    <Plus className="w-3 h-3" /> Agregar Mesa
                  </button>
                </div>
              ))}

              <button onClick={addArea} className="btn-secondary w-full text-xs">
                <Plus className="w-3 h-3" /> Agregar Área
              </button>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1"><ChevronLeft className="w-4 h-4" /> Atrás</button>
                <button onClick={() => saveAreas.mutate()} disabled={saveAreas.isPending} className="btn-primary flex-1">
                  {saveAreas.isPending ? 'Guardando...' : 'Continuar'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card space-y-4">
              <h2 className="text-lg font-bold">Activación de Módulos</h2>
              <p className="text-xs text-on-surface-muted">Selecciona los módulos que deseas activar</p>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {allModules.map((mod) => (
                  <label key={mod.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container cursor-pointer">
                    <input
                      type="checkbox"
                      checked={features.includes(mod.id)}
                      onChange={() => setFeatures(features.includes(mod.id) ? features.filter((f) => f !== mod.id) : [...features, mod.id])}
                      className="rounded border-on-surface-muted/30 text-primary focus:ring-primary/30"
                    />
                    <span className="text-sm font-medium">{mod.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-on-surface-muted">{features.length} módulos seleccionados</p>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1"><ChevronLeft className="w-4 h-4" /> Atrás</button>
                <button onClick={() => saveModules.mutate()} disabled={saveModules.isPending} className="btn-primary flex-1">
                  {saveModules.isPending ? 'Guardando...' : 'Continuar'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card space-y-4 text-center">
              <Rocket className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-lg font-bold">¡Todo Listo!</h2>
              <p className="text-sm text-on-surface-muted">
                Has configurado <strong>{profile.name}</strong> con{' '}
                {areas.reduce((s, a) => s + a.tables.length, 0)} mesas en {areas.length} área{areas.length > 1 ? 's' : ''}{' '}
                y {features.length} módulo{features.length !== 1 ? 's' : ''}.
              </p>
              <p className="text-xs text-on-surface-muted">Revisa y lanza tu sistema</p>
              <button onClick={() => doLaunch.mutate()} disabled={doLaunch.isPending} className="btn-primary w-full text-base py-3">
                {doLaunch.isPending ? 'Lanzando...' : '🚀 Ir al Dashboard'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
