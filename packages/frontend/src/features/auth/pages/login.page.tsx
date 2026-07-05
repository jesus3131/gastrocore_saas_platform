import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useLogin, useSuperAdminLogin } from '../../../app/hooks/use-auth'

export function LoginPage() {
  const [superAdminMode, setSuperAdminMode] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>()
  const login = useLogin()
  const superAdminLogin = useSuperAdminLogin()
  const mutation = superAdminMode ? superAdminLogin : login

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <h2 className="text-xl font-bold text-on-surface text-center">
        {superAdminMode ? 'Acceso Super Admin' : 'Iniciar Sesión'}
      </h2>

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

      <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
        {mutation.isPending ? 'Iniciando...' : superAdminMode ? 'Acceder como Super Admin' : 'Iniciar Sesión'}
      </button>

      <p className="text-center text-xs text-on-surface-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">Regístrate</Link>
      </p>

      <div className="border-t border-on-surface-muted/10 pt-3">
        <button
          type="button"
          onClick={() => setSuperAdminMode(!superAdminMode)}
          className="text-xs text-on-surface-muted hover:text-primary underline cursor-pointer w-full text-center"
        >
          {superAdminMode ? '← Acceso de restaurante' : 'Acceso Super Admin →'}
        </button>
      </div>
    </form>
  )
}
