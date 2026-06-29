import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useRegister } from '../../../app/hooks/use-auth'
import { useState } from 'react'

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
  {
    id: 'basic',
    name: 'Básico',
    price: '$49/mes',
    priceYearly: '$470/año',
    desc: 'Para restaurantes pequeños que inician',
    features: ['POS + Mesas', 'KDS Cocina', 'Split de cuentas'],
    users: 3,
    branches: 1,
  },
  {
    id: 'pro',
    name: 'Profesional',
    price: '$129/mes',
    priceYearly: '$1,238/año',
    desc: 'Para restaurantes en crecimiento',
    features: ['Todo Básico +', 'Inventario + RRHH', 'CRM + Delivery'],
    users: 15,
    branches: 3,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$349/mes',
    priceYearly: '$3,350/año',
    desc: 'Para franquicias y grupos grandes',
    features: ['Todo Profesional +', 'BCG Matrix + Loyalty', 'Multi-sucursal'],
    users: 999,
    branches: 999,
  },
]

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<{
    email: string
    name: string
    tenantName: string
    businessType: string
  }>()
  const registerMutation = useRegister()
  const [selectedPlan, setSelectedPlan] = useState('basic')

  return (
    <form onSubmit={handleSubmit((data) => registerMutation.mutate({ ...data, planId: selectedPlan }))} className="space-y-4">
      <h2 className="text-xl font-bold text-on-surface text-center">Crear Cuenta</h2>
      <p className="text-xs text-on-surface-muted text-center">
        Recibirás tus credenciales de acceso por correo electrónico
      </p>

      <div>
        <label className="label">Nombre del Restaurante</label>
        <input {...register('tenantName', { required: true })} className="input" placeholder="Mi Restaurante" />
      </div>

      <div>
        <label className="label">Tipo de Negocio</label>
        <select {...register('businessType', { required: true })} className="select">
          <option value="">Selecciona...</option>
          {businessTypes.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Tu Nombre</label>
        <input {...register('name', { required: true })} className="input" placeholder="Juan Pérez" />
      </div>

      <div>
        <label className="label">Correo electrónico</label>
        <input type="email" {...register('email', { required: true })} className="input" placeholder="tu@restaurante.com" />
      </div>

      <div className="space-y-2">
        <label className="label">Selecciona tu Plan</label>
        <div className="grid gap-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedPlan === plan.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-on-surface-muted/10'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="radio" name="plan" checked={selectedPlan === plan.id} onChange={() => setSelectedPlan(plan.id)} className="accent-primary" />
                  <div>
                    <span className="text-sm font-bold text-on-surface">{plan.name}</span>
                    <span className="text-xs text-on-surface-muted ml-2">{plan.desc}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{plan.price}</p>
                  <p className="text-2xs text-on-surface-muted">{plan.priceYearly}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1.5 ml-5">
                <span className="text-2xs text-on-surface-muted">↑ {plan.users} usuarios</span>
                <span className="text-2xs text-on-surface-muted">↑ {plan.branches} sucursales</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
        <p className="text-xs text-on-surface-muted text-center">
          Te enviaremos las credenciales de acceso al correo registrado.
          Recibirás un enlace para iniciar sesión y completar la configuración de tu restaurante.
        </p>
      </div>

      <button type="submit" disabled={registerMutation.isPending} className="btn-primary w-full">
        {registerMutation.isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>

      <p className="text-center text-xs text-on-surface-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">Inicia Sesión</Link>
      </p>
    </form>
  )
}
