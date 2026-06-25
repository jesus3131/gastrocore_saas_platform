import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Users, BarChart3,
  Settings, LogOut, User, ChevronDown, Bell, Table2,
} from 'lucide-react'
import { useAuthStore } from '../app/store/auth.store'
import { useLogout } from '../app/hooks/use-auth'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos/tables', icon: Table2, label: 'Mapa de Mesas' },
  { to: '/pos', icon: ShoppingCart, label: 'Punto de Venta' },
  { to: '/inventory', icon: ClipboardList, label: 'Inventario' },
  { to: '/inventory/recipes', icon: ClipboardList, label: 'Escandallos' },
  { to: '/hr', icon: Users, label: 'Personal' },
  { to: '/analytics', icon: BarChart3, label: 'Analítica' },
  { to: '/crm', icon: User, label: 'CRM' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
]

export function DashboardLayout() {
  const { user } = useAuthStore()
  const logout = useLogout()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-container">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-surface border-r border-on-surface-muted/10">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-on-surface-muted/10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">GastroCore</h2>
            <p className="text-2xs text-on-surface-muted">{user?.tenantName || 'Restaurante'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-on-surface-muted/10">
          <button onClick={logout} className="sidebar-link w-full text-error hover:bg-error/5">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-surface border-b border-on-surface-muted/10 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            className="lg:hidden btn-ghost btn-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button className="btn-ghost btn-sm relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-error rounded-full" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="hidden lg:inline text-sm font-medium text-on-surface">
                {user?.name || 'Usuario'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface shadow-xl">
            <div className="p-4 border-b">
              <h2 className="font-bold">GastroCore</h2>
            </div>
            <nav className="p-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`sidebar-link ${location.pathname === item.to ? 'active' : ''}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  )
}
