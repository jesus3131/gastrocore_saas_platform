import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, Store, Table2, Puzzle, Rocket } from 'lucide-react'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../app/store/auth.store'

const steps = [
  { id: 'profile', label: 'Perfil', icon: Store },
  { id: 'areas', label: 'Áreas y Mesas', icon: Table2 },
  { id: 'modules', label: 'Módulos', icon: Puzzle },
  { id: 'launch', label: 'Lanzamiento', icon: Rocket },
]

export function OnboardingPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()

  const [profile, setProfile] = useState({ name: '', businessType: 'fine_dining', locale: 'es-MX', timezone: 'America/Mexico_City', currency: 'MXN' })
  const [areas, setAreas] = useState([{ name: 'Salón Principal', type: 'dining', tables: [{ label: 'M1', capacity: 2 }, { label: 'M2', capacity: 4 }] }])
  const [features, setFeatures] = useState<string[]>([])
  const [launching, setLaunching] = useState(false)

  const saveProfile = useMutation({
    mutationFn: () => api.post('/onboarding/profile', profile),
    onSuccess: () => { setStep(1); toast.success('Perfil guardado') },
  })

  const saveAreas = useMutation({
    mutationFn: () => api.post('/onboarding/areas', { branches: [{ name: profile.name || 'Sucursal Principal', areas }] }),
    onSuccess: () => { setStep(2); toast.success('Áreas y mesas configuradas') },
  })

  const saveModules = useMutation({
    mutationFn: () => api.post('/onboarding/modules', { features: features.map((f) => ({ feature: f, enabled: true })) }),
    onSuccess: () => { setStep(3); toast.success('Módulos activados') },
  })

  const doLaunch = useMutation({
    mutationFn: () => api.post('/onboarding/launch'),
    onSuccess: () => {
      toast.success('¡Sistema listo para usar!')
      updateUser({ ...user, onboardingCompleted: true })
      navigate('/dashboard')
    },
  })

  return (
    <div className="min-h-screen bg-surface-container flex flex-col">
      {/* Progress */}
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
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Tipo de Negocio</label>
                <select value={profile.businessType} onChange={(e) => setProfile({ ...profile, businessType: e.target.value })} className="select">
                  <option value="fine_dining">Alta Cocina</option>
                  <option value="fast_food">Fast Food</option>
                  <option value="cafe">Cafetería</option>
                  <option value="food_truck">Food Truck</option>
                  <option value="bar">Bar</option>
                </select>
              </div>
              <button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="btn-primary w-full">
                {saveProfile.isPending ? 'Guardando...' : 'Continuar'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="card space-y-4">
              <h2 className="text-lg font-bold">Áreas y Mesas</h2>
              {areas.map((area, i) => (
                <div key={i} className="p-3 rounded-lg bg-surface-container">
                  <input value={area.name} onChange={(e) => { const a = [...areas]; a[i].name = e.target.value; setAreas(a) }} className="input mb-2" placeholder="Nombre del área" />
                  <p className="text-xs text-on-surface-muted mb-2">{area.tables.length} mesas</p>
                </div>
              ))}
              <button onClick={() => setAreas([...areas, { name: 'Nueva Área', type: 'dining', tables: [{ label: 'M1', capacity: 2 }] }])} className="btn-secondary w-full text-xs">
                + Agregar Área
              </button>
              <div className="flex gap-2">
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
              <p className="text-xs text-on-surface-muted">Selecciona los módulos operativos para tu negocio</p>
              {['kds', 'online_ordering', 'inventory_auto', 'hr_scheduling', 'crm_full', 'loyalty_program', 'bcg_matrix', 'delivery_integration'].map((mod) => (
                <label key={mod} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container cursor-pointer">
                  <input type="checkbox" checked={features.includes(mod)} onChange={() => setFeatures(features.includes(mod) ? features.filter((f) => f !== mod) : [...features, mod])} className="rounded border-on-surface-muted/30 text-primary focus:ring-primary/30" />
                  <span className="text-sm font-medium capitalize">{mod.replace(/_/g, ' ')}</span>
                </label>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1"><ChevronLeft className="w-4 h-4" /> Atrás</button>
                <button onClick={() => saveModules.mutate()} disabled={saveModules.isPending} className="btn-primary flex-1">
                  {saveModules.isPending ? 'Guardando...' : 'Continuar'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card space-y-4 text-center">
              <Rocket className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-lg font-bold">¡Todo Listo!</h2>
              <p className="text-sm text-on-surface-muted">Revisa la configuración y lanza tu sistema</p>
              <button onClick={() => doLaunch.mutate()} disabled={doLaunch.isPending} className="btn-primary w-full">
                {doLaunch.isPending ? 'Lanzando...' : 'Ir al Dashboard'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
