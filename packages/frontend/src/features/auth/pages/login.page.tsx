import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useLogin } from '../../../app/hooks/use-auth'

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>()
  const login = useLogin()

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
      <h2 className="text-xl font-bold text-on-surface text-center">Iniciar Sesión</h2>

      <div>
        <label className="label">Correo electrónico</label>
        <input type="email" {...register('email', { required: true })} className="input" placeholder="tu@restaurante.com" />
        {errors.email && <p className="text-xs text-error mt-1">Campo requerido</p>}
      </div>

      <div>
        <label className="label">Contraseña</label>
        <input type="password" {...register('password', { required: true })} className="input" placeholder="••••••" />
        {errors.password && <p className="text-xs text-error mt-1">Campo requerido</p>}
      </div>

      <button type="submit" disabled={login.isPending} className="btn-primary w-full">
        {login.isPending ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>

      <p className="text-center text-xs text-on-surface-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">Regístrate</Link>
      </p>
    </form>
  )
}
