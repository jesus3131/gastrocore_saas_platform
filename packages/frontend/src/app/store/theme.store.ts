import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggle: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        applyTheme(next)
        set({ theme: next })
      },
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    { name: 'restopro-theme' },
  ),
)

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

// Initialize on load
const stored = localStorage.getItem('restopro-theme')
if (stored) {
  try {
    const parsed = JSON.parse(stored)
    const theme: Theme = parsed?.state?.theme || 'light'
    applyTheme(theme)
  } catch { /* ignore */ }
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(prefersDark ? 'dark' : 'light')
}
