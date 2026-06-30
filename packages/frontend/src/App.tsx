import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './app/store/auth.store'
import { DashboardLayout } from './layouts/dashboard.layout'
import { AuthLayout } from './layouts/auth.layout'
import { api } from './lib/api'
import { LoginPage } from './features/auth/pages/login.page'
import { RegisterPage } from './features/auth/pages/register.page'
import { DashboardPage } from './features/dashboard/pages/dashboard.page'
import { PosOrderPage } from './features/pos/pages/pos-order.page'
import { TableMapPage } from './features/pos/pages/table-map.page'
import { CheckoutPage } from './features/pos/pages/checkout.page'
import { KdsPage } from './features/pos/pages/kds.page'
import { PosServicePage } from './features/pos/pages/pos-service.page'
import { InventoryPage } from './features/inventory/pages/inventory.page'
import { RecipePage } from './features/inventory/pages/recipe.page'
import { HrDashboardPage } from './features/hr/pages/hr-dashboard.page'
import { AnalyticsPage } from './features/analytics/pages/analytics.page'
import { CustomersPage } from './features/crm/pages/customers.page'
import { LoyaltyPage } from './features/crm/pages/loyalty.page'
import { OnboardingPage } from './features/onboarding/pages/onboarding.page'
import { SettingsPage } from './features/settings/pages/settings.page'
import { ProfilePage } from './features/settings/pages/profile.page'
import { DeliveryHubPage } from './features/integrations/pages/delivery-hub.page'
import { ChannelConfigPage } from './features/integrations/pages/channel-config.page'
import { AccountingOverviewPage } from './features/accounting/pages/accounting-overview.page'
import { ChartOfAccountsPage } from './features/accounting/pages/chart-of-accounts.page'
import { JournalEntriesPage } from './features/accounting/pages/journal-entries.page'
import { FinancialStatementsPage } from './features/accounting/pages/financial-statements.page'
import { AccountingSettingsPage } from './features/accounting/pages/accounting-settings.page'
import { SuperAdminPage } from './features/super-admin/pages/super-admin.page'
import { CompanyDetailPage } from './features/super-admin/pages/company-detail.page'

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, tokens, logout, setAuth, user } = useAuthStore()
  const [checking, setChecking] = useState(isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) {
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
  }, [])

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
  const needsOnboarding = user && !(user as any).onboardingCompleted
  if (needsOnboarding) return <Navigate to="/onboarding" replace />
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Onboarding */}
      <Route path="/onboarding" element={
        <SessionGuard>
          <ProtectedRoute>
            <OnboardingPage />
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
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pos" element={<PosOrderPage />} />
        <Route path="pos/tables" element={<TableMapPage />} />
        <Route path="pos/checkout" element={<CheckoutPage />} />
        <Route path="pos/kds" element={<KdsPage />} />
        <Route path="pos/service" element={<PosServicePage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="inventory/recipes" element={<RecipePage />} />
        <Route path="hr" element={<HrDashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="crm" element={<CustomersPage />} />
        <Route path="crm/loyalty" element={<LoyaltyPage />} />
        <Route path="integrations" element={<DeliveryHubPage />} />
        <Route path="integrations/channels" element={<ChannelConfigPage />} />
        <Route path="accounting" element={<AccountingOverviewPage />} />
        <Route path="accounting/accounts" element={<ChartOfAccountsPage />} />
        <Route path="accounting/journal-entries" element={<JournalEntriesPage />} />
        <Route path="accounting/statements" element={<FinancialStatementsPage />} />
        <Route path="accounting/settings" element={<AccountingSettingsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/profile" element={<ProfilePage />} />
        <Route path="super-admin" element={<SuperAdminPage />} />
        <Route path="super-admin/companies/:id" element={<CompanyDetailPage />} />
      </Route>
    </Routes>
  )
}
