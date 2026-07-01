import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../app/store/auth.store'

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">RestoPro Enterprise</h1>
          <p className="text-primary-200 text-sm mt-2">Gestión inteligente para tu restaurante</p>
        </div>
        <div className="bg-white rounded-xl shadow-2xl p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
