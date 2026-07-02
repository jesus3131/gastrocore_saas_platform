import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './app/store/auth.store'
import { DashboardLayout } from './layouts/dashboard.layout'
import { AuthLayout } from './layouts/auth.layout'
import { api } from './lib/api'

const LoginPage = lazy(() => import('./features/auth/pages/login.page').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./features/auth/pages/register.page').then(m => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('./features/dashboard/pages/dashboard.page').then(m => ({ default: m.DashboardPage })))
const PosOrderPage = lazy(() => import('./features/pos/pages/pos-order.page').then(m => ({ default: m.PosOrderPage })))
const TableMapPage = lazy(() => import('./features/pos/pages/table-map.page').then(m => ({ default: m.TableMapPage })))
const CheckoutPage = lazy(() => import('./features/pos/pages/checkout.page').then(m => ({ default: m.CheckoutPage })))
const KdsPage = lazy(() => import('./features/pos/pages/kds.page').then(m => ({ default: m.KdsPage })))
const PosServicePage = lazy(() => import('./features/pos/pages/pos-service.page').then(m => ({ default: m.PosServicePage })))
const InventoryPage = lazy(() => import('./features/inventory/pages/inventory.page').then(m => ({ default: m.InventoryPage })))
const RecipePage = lazy(() => import('./features/inventory/pages/recipe.page').then(m => ({ default: m.RecipePage })))
const HrDashboardPage = lazy(() => import('./features/hr/pages/hr-dashboard.page').then(m => ({ default: m.HrDashboardPage })))
const AnalyticsPage = lazy(() => import('./features/analytics/pages/analytics.page').then(m => ({ default: m.AnalyticsPage })))
const CustomersPage = lazy(() => import('./features/crm/pages/customers.page').then(m => ({ default: m.CustomersPage })))
const LoyaltyPage = lazy(() => import('./features/crm/pages/loyalty.page').then(m => ({ default: m.LoyaltyPage })))
const OnboardingPage = lazy(() => import('./features/onboarding/pages/onboarding.page').then(m => ({ default: m.OnboardingPage })))
const SettingsPage = lazy(() => import('./features/settings/pages/settings.page').then(m => ({ default: m.SettingsPage })))
const ProfilePage = lazy(() => import('./features/settings/pages/profile.page').then(m => ({ default: m.ProfilePage })))
const DeliveryHubPage = lazy(() => import('./features/integrations/pages/delivery-hub.page').then(m => ({ default: m.DeliveryHubPage })))
const ChannelConfigPage = lazy(() => import('./features/integrations/pages/channel-config.page').then(m => ({ default: m.ChannelConfigPage })))
const AccountingOverviewPage = lazy(() => import('./features/accounting/pages/accounting-overview.page').then(m => ({ default: m.AccountingOverviewPage })))
const ChartOfAccountsPage = lazy(() => import('./features/accounting/pages/chart-of-accounts.page').then(m => ({ default: m.ChartOfAccountsPage })))
const JournalEntriesPage = lazy(() => import('./features/accounting/pages/journal-entries.page').then(m => ({ default: m.JournalEntriesPage })))
const FinancialStatementsPage = lazy(() => import('./features/accounting/pages/financial-statements.page').then(m => ({ default: m.FinancialStatementsPage })))
const AccountingSettingsPage = lazy(() => import('./features/accounting/pages/accounting-settings.page').then(m => ({ default: m.AccountingSettingsPage })))
const SuperAdminPage = lazy(() => import('./features/super-admin/pages/super-admin.page').then(m => ({ default: m.SuperAdminPage })))
const CompanyDetailPage = lazy(() => import('./features/super-admin/pages/company-detail.page').then(m => ({ default: m.CompanyDetailPage })))

const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, tokens, user, logout, setAuth } = useAuthStore()
  const [checking, setChecking] = useState(isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) {
      setChecking(false)
      return
    }
    if ((user as any)?.isSuperAdmin || user?.globalRole === 'super_admin') {
      setChecking(false)
      return
    }
    api.get('/auth/me')
      .then((res) => {
        setAuth(res.data.data, tokens)
        setChecking(false)
      })
      .catch(() => {
        logout()
        setChecking(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) return null
  return <>{children}</>
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if ((user as any)?.isSuperAdmin || user?.globalRole === 'super_admin') return <>{children}</>
  if (user && (user as any).onboardingCompleted === false) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function SuperAdminBlock({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if ((user as any)?.isSuperAdmin || user?.globalRole === 'super_admin') return <Navigate to="/super-admin" replace />
  return <>{children}</>
}

function WaiterBlock({ children }: { children: React.ReactNode }) {
  const waiter = useAuthStore((s) => s.waiter)
  const location = useLocation()
  if (waiter && location.pathname !== '/pos/service') return <Navigate to="/pos/service" replace />
  return <>{children}</>
}

export function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
      </Route>

      {/* Onboarding */}
      <Route path="/onboarding" element={
        <SessionGuard>
          <ProtectedRoute>
            <SuperAdminBlock>
              <Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense>
            </SuperAdminBlock>
          </ProtectedRoute>
        </SessionGuard>
      } />

      {/* App routes */}
      <Route path="/" element={
        <SessionGuard>
          <ProtectedRoute>
            <OnboardingGuard>
              <WaiterBlock>
                <DashboardLayout />
              </WaiterBlock>
            </OnboardingGuard>
          </ProtectedRoute>
        </SessionGuard>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
        <Route path="pos" element={<Suspense fallback={<PageLoader />}><PosOrderPage /></Suspense>} />
        <Route path="pos/tables" element={<Suspense fallback={<PageLoader />}><TableMapPage /></Suspense>} />
        <Route path="pos/checkout" element={<Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense>} />
        <Route path="pos/kds" element={<Suspense fallback={<PageLoader />}><KdsPage /></Suspense>} />
        <Route path="pos/service" element={<Suspense fallback={<PageLoader />}><PosServicePage /></Suspense>} />
        <Route path="inventory" element={<Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>} />
        <Route path="inventory/recipes" element={<Suspense fallback={<PageLoader />}><RecipePage /></Suspense>} />
        <Route path="hr" element={<Suspense fallback={<PageLoader />}><HrDashboardPage /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
        <Route path="crm" element={<Suspense fallback={<PageLoader />}><CustomersPage /></Suspense>} />
        <Route path="crm/loyalty" element={<Suspense fallback={<PageLoader />}><LoyaltyPage /></Suspense>} />
        <Route path="integrations" element={<Suspense fallback={<PageLoader />}><DeliveryHubPage /></Suspense>} />
        <Route path="integrations/channels" element={<Suspense fallback={<PageLoader />}><ChannelConfigPage /></Suspense>} />
        <Route path="accounting" element={<Suspense fallback={<PageLoader />}><AccountingOverviewPage /></Suspense>} />
        <Route path="accounting/accounts" element={<Suspense fallback={<PageLoader />}><ChartOfAccountsPage /></Suspense>} />
        <Route path="accounting/journal-entries" element={<Suspense fallback={<PageLoader />}><JournalEntriesPage /></Suspense>} />
        <Route path="accounting/statements" element={<Suspense fallback={<PageLoader />}><FinancialStatementsPage /></Suspense>} />
        <Route path="accounting/settings" element={<Suspense fallback={<PageLoader />}><AccountingSettingsPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
        <Route path="settings/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        <Route path="super-admin" element={<Suspense fallback={<PageLoader />}><SuperAdminPage /></Suspense>} />
        <Route path="super-admin/companies/:id" element={<Suspense fallback={<PageLoader />}><CompanyDetailPage /></Suspense>} />
      </Route>
    </Routes>
  )
}