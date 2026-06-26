import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthTokens } from '@gastrocore/shared'

interface AuthState {
  user: Record<string, any> | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  waiter: { id: string; name: string; role: string } | null
  setAuth: (user: Record<string, any>, tokens: AuthTokens) => void
  logout: () => void
  updateUser: (user: Record<string, any>) => void
  setWaiter: (waiter: { id: string; name: string; role: string } | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      waiter: null,
      setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
      logout: () => set({ user: null, tokens: null, isAuthenticated: false, waiter: null }),
      updateUser: (user) => set({ user }),
      setWaiter: (waiter) => set({ waiter }),
    }),
    { name: 'restopro-auth' },
  ),
)
