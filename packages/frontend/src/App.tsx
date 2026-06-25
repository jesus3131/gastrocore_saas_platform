import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './app/store/auth.store'
import { DashboardLayout } from './layouts/dashboard.layout'
import { AuthLayout } from './layouts/auth.layout'
import { LoginPage } from './features/auth/pages/login.page'
import { RegisterPage } from './features/auth/pages/register.page'
import { DashboardPage } from './features/dashboard/pages/dashboard.page'
import { PosOrderPage } from './features/pos/pages/pos-order.page'
import { TableMapPage } from './features/pos/pages/table-map.page'
import { InventoryPage } from './features/inventory/pages/inventory.page'
import { RecipePage } from './features/inventory/pages/recipe.page'
import { HrDashboardPage } from './features/hr/pages/hr-dashboard.page'
import { AnalyticsPage } from './features/analytics/pages/analytics.page'
import { CustomersPage } from './features/crm/pages/customers.page'
import { LoyaltyPage } from './features/crm/pages/loyalty.page'
import { OnboardingPage } from './features/onboarding/pages/onboarding.page'
import { SettingsPage } from './features/settings/pages/settings.page'

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
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* App routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <DashboardLayout />
          </OnboardingGuard>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pos" element={<PosOrderPage />} />
        <Route path="pos/tables" element={<TableMapPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="inventory/recipes" element={<RecipePage />} />
        <Route path="hr" element={<HrDashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="crm" element={<CustomersPage />} />
        <Route path="crm/loyalty" element={<LoyaltyPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
