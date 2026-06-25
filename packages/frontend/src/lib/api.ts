import axios from 'axios'
import { useAuthStore } from '../app/store/auth.store'

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach auth token
api.interceptors.request.use((config) => {
  const { tokens, user } = useAuthStore.getState()

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`
  }
  if (user?.tenantId) {
    config.headers['x-tenant-id'] = user.tenantId
  }

  return config
})

// Response interceptor: handle refresh token
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const { tokens } = useAuthStore.getState()
        if (!tokens?.refreshToken) throw new Error('No refresh token')

        const res = await axios.post('/api/v1/auth/refresh', {
          refreshToken: tokens.refreshToken,
        })

        const { setAuth, user } = useAuthStore.getState()
        setAuth(user!, res.data.data)
        original.headers.Authorization = `Bearer ${res.data.data.accessToken}`

        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)
