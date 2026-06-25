import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthTokens } from '@gastrocore/shared'

interface AuthState {
  user: Record<string, any> | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  setAuth: (user: Record<string, any>, tokens: AuthTokens) => void
  logout: () => void
  updateUser: (user: Record<string, any>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    { name: 'gastrocore-auth' },
  ),
)
