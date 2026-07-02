import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuthStore } from '../store/auth.store'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post('/auth/login', data).then((r) => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens)
      toast.success('Inicio de sesión exitoso')
      navigate('/dashboard')
    },
    onError: (err: any) => {
      const message = err.response?.data?.error?.message || 'Error al iniciar sesión'
      if (message === 'Use super admin login endpoint') {
        toast.error('Usa el botón "Super Admin" debajo del formulario')
      } else {
        toast.error(message)
      }
    },
  })
}

export function useSuperAdminLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post('/auth/super-admin/login', data).then((r) => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens)
      toast.success('Bienvenido Super Admin')
      navigate('/super-admin')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Error al iniciar sesión')
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: {
      email: string
      name: string
      tenantName: string
      businessType: string
      planId?: string
    }) => api.post('/auth/register', data).then((r) => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens)
      toast.success('Cuenta creada — revisa tu correo para las credenciales')
      navigate('/onboarding')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Error al registrar')
    },
  })
}

export function useProfile() {
  const { user, updateUser } = useAuthStore()

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/auth/me')
      updateUser(res.data.data)
      return res.data.data
    },
    enabled: !!user,
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return () => {
    logout()
    navigate('/login')
    toast.success('Sesión cerrada')
  }
}
