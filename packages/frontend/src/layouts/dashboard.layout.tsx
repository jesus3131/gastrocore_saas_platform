import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Users, BarChart3,
  Settings, LogOut, User, ChevronDown, Bell, Table2, Gift,
  Truck, CreditCard, ChefHat, UtensilsCrossed, BookOpen,
  FileSpreadsheet, ScrollText, Menu, X, Sun, Moon, Building2,
} from 'lucide-react'
import { useAuthStore } from '../app/store/auth.store'
import { useThemeStore } from '../app/store/theme.store'
import { useLogout } from '../app/hooks/use-auth'
import { useState, useEffect } from 'react'

interface NavItem { to: string; icon: any; label: string; feature?: string }

const navItemsAll: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos/service', icon: UtensilsCrossed, label: 'Servicio Mesas', feature: 'pos' },
  { to: '/pos/tables', icon: Table2, label: 'Mapa de Mesas', feature: 'pos' },
  { to: '/pos', icon: ShoppingCart, label: 'POS', feature: 'pos' },
  { to: '/pos/checkout', icon: CreditCard, label: 'Cobro', feature: 'pos' },
  { to: '/pos/kds', icon: ChefHat, label: 'Comandas', feature: 'pos' },
  { to: '/inventory', icon: ClipboardList, label: 'Inventario', feature: 'inventory_auto' },
  { to: '/inventory/recipes', icon: ClipboardList, label: 'Escandallos', feature: 'inventory_auto' },
  { to: '/hr', icon: Users, label: 'Personal', feature: 'hr_scheduling' },
  { to: '/analytics', icon: BarChart3, label: 'Analítica', feature: 'analytics' },
  { to: '/accounting', icon: BookOpen, label: 'Contabilidad', feature: 'accounting' },
  { to: '/accounting/accounts', icon: BookOpen, label: 'Cuentas Contables', feature: 'accounting' },
  { to: '/accounting/journal-entries', icon: ScrollText, label: 'Asientos', feature: 'accounting' },
  { to: '/accounting/statements', icon: FileSpreadsheet, label: 'Estados Financieros', feature: 'accounting' },
  { to: '/accounting/settings', icon: Settings, label: 'Config. Contable', feature: 'accounting' },
  { to: '/crm', icon: User, label: 'CRM Clientes', feature: 'crm_full' },
  { to: '/crm/loyalty', icon: Gift, label: 'Lealtad', feature: 'crm_full' },
  { to: '/integrations', icon: Truck, label: 'Delivery', feature: 'delivery_integration' },
  { to: '/integrations/channels', icon: Truck, label: 'Canales', feature: 'delivery_integration' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
  { to: '/settings/profile', icon: User, label: 'Mi Perfil' },
]

const superAdminNavItems = [
  { to: '/super-admin', icon: Building2, label: 'Empresas' },
  { to: '/settings/profile', icon: User, label: 'Mi Perfil' },
]

const bottomNavItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos', icon: ShoppingCart, label: 'POS', feature: 'pos' },
  { to: '/inventory', icon: ClipboardList, label: 'Inventario', feature: 'inventory_auto' },
  { to: '/accounting', icon: BookOpen, label: 'Contabilidad', feature: 'accounting' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
]

const superAdminBottomNav = [
  { to: '/super-admin', icon: Building2, label: 'Empresas' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
]

export function DashboardLayout() {
  const { user, waiter } = useAuthStore()
  const isSuperAdmin = user?.role === 'super_admin'
  const flags: string[] = user?.featureFlags || []
  const navItems: NavItem[] = isSuperAdmin
    ? superAdminNavItems
    : navItemsAll.filter(item => !item.feature || flags.includes(item.feature))
  const { theme, toggle: toggleTheme } = useThemeStore()
  const logout = useLogout()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  if (waiter) {
    return (
      <div className="flex h-screen overflow-hidden bg-surface-container">
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    )
  }

  const currentPage = navItems.find(i => location.pathname === i.to)
  const pageTitle = currentPage?.label || ''

  return (
    <div className="flex h-screen overflow-hidden bg-surface-container">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-surface border-r border-on-surface-muted/10 shrink-0">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-on-surface-muted/10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">RestoPro</h2>
            <p className="text-2xs text-on-surface-muted">{user?.tenantName || 'Restaurante'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-on-surface-muted/10 space-y-1">
          <button onClick={toggleTheme} className="sidebar-link w-full">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          <button onClick={logout} className="sidebar-link w-full text-error hover:bg-error/5">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-surface border-b border-on-surface-muted/10 flex items-center justify-between px-3 lg:px-6 shrink-0">
          <button className="lg:hidden btn-ghost btn-sm" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-on-surface hidden sm:block">{pageTitle}</span>
          <div className="flex-1 sm:flex-none" />
          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={toggleTheme} className="btn-ghost btn-sm hidden sm:flex">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="btn-ghost btn-sm relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-error rounded-full" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-xs">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <span className="hidden lg:inline text-sm font-medium text-on-surface truncate max-w-[120px]">{user?.name || 'Usuario'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface border-t border-on-surface-muted/10">
        <div className="flex items-center justify-around h-16 px-1">
          {(isSuperAdmin ? superAdminBottomNav : bottomNavItems.filter(item => !item.feature || flags.includes(item.feature))).map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            return (
              <NavLink key={item.to} to={item.to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-muted hover:text-on-surface'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-2xs font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-surface shadow-2xl transition-transform duration-200 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-on-surface-muted/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h2 className="font-bold text-on-surface">RestoPro</h2>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="btn-ghost btn-sm p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <NavLink key={item.to} to={item.to} end
                  onClick={() => setMobileMenuOpen(false)}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              )
            })}
            <hr className="my-3 border-on-surface-muted/10" />
            <button onClick={() => { toggleTheme(); setMobileMenuOpen(false) }} className="sidebar-link w-full">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
            <button onClick={() => { logout(); setMobileMenuOpen(false) }} className="sidebar-link w-full text-error hover:bg-error/5">
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </nav>
        </aside>
      </div>
    </div>
  )
}
