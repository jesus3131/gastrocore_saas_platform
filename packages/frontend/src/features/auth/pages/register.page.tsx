import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useRegister } from '../../../app/hooks/use-auth'

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

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<{
    email: string; password: string; name: string; tenantName: string; businessType: string
  }>()
  const registerMutation = useRegister()

  return (
    <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
      <h2 className="text-xl font-bold text-on-surface text-center">Crear Cuenta</h2>

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

      <div>
        <label className="label">Contraseña</label>
        <input type="password" {...register('password', { required: true, minLength: 6 })} className="input" placeholder="Mínimo 6 caracteres" />
        {errors.password && <p className="text-xs text-error mt-1">Mínimo 6 caracteres</p>}
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
