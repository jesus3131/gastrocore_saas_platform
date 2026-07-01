import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../app/store/auth.store'
import { User, Lock, Eye, EyeOff } from 'lucide-react'

export function ProfilePage() {
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.put('/auth/profile', data),
    onSuccess: () => toast.success('Perfil actualizado'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const changePassword = useMutation({
    mutationFn: (data: any) => api.put('/auth/change-password', data),
    onSuccess: () => { toast.success('Contraseña actualizada'); setPasswords({ currentPassword: '', newPassword: '', confirm: '' }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const handleProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({ name, email })
  }

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirm) return toast.error('Las contraseñas no coinciden')
    if (passwords.newPassword.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres')
    changePassword.mutate({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-lg font-bold text-on-surface">Mi Perfil</h1>

      <div className="card space-y-4">
        <h2 className="text-sm font-bold text-on-surface flex items-center gap-2"><User className="w-4 h-4" /> Información Personal</h2>
        <form onSubmit={handleProfile} className="space-y-3">
          <div>
            <label className="label">Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input text-sm" required />
          </div>
          <div>
            <label className="label">Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input text-sm" required />
          </div>
          <div className="text-xs text-on-surface-muted">Rol: <span className="font-medium capitalize">{user?.role}</span></div>
          <button type="submit" disabled={updateProfile.isPending} className="btn-primary btn-sm">
            {updateProfile.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-bold text-on-surface flex items-center gap-2"><Lock className="w-4 h-4" /> Cambiar Contraseña</h2>
        <form onSubmit={handlePassword} className="space-y-3">
          <div>
            <label className="label">Contraseña Actual</label>
            <input type={showPwd ? 'text' : 'password'} value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="input text-sm" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Nueva Contraseña</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="input text-sm w-full pr-8" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-muted">
                  {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirmar Nueva</label>
              <input type={showPwd ? 'text' : 'password'} value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="input text-sm" required />
            </div>
          </div>
          <button type="submit" disabled={changePassword.isPending} className="btn-primary btn-sm">
            {changePassword.isPending ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
