import type { Express } from 'express'
import { API_PREFIX } from '@gastrocore/shared'
import { authRouter } from '../modules/auth/auth.routes.js'
import { tenantRouter } from '../modules/tenants/tenant.routes.js'
import { posRouter } from '../modules/pos/pos.routes.js'
import { inventoryRouter } from '../modules/inventory/inventory.routes.js'
import { hrRouter } from '../modules/hr/hr.routes.js'
import { analyticsRouter } from '../modules/analytics/analytics.routes.js'
import { crmRouter } from '../modules/crm/crm.routes.js'
import { onboardingRouter } from '../modules/onboarding/onboarding.routes.js'
import { subscriptionRouter } from '../modules/subscriptions/subscription.routes.js'

export function registerRoutes(app: Express) {
  app.use(`${API_PREFIX}/auth`, authRouter)
  app.use(`${API_PREFIX}/tenants`, tenantRouter)
  app.use(`${API_PREFIX}/pos`, posRouter)
  app.use(`${API_PREFIX}/inventory`, inventoryRouter)
  app.use(`${API_PREFIX}/hr`, hrRouter)
  app.use(`${API_PREFIX}/analytics`, analyticsRouter)
  app.use(`${API_PREFIX}/crm`, crmRouter)
  app.use(`${API_PREFIX}/onboarding`, onboardingRouter)
  app.use(`${API_PREFIX}/subscriptions`, subscriptionRouter)

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
}
