import { Router } from 'express'
import { superAdminController } from './super-admin.controller.js'
import { superAdminAuth } from './super-admin.guard.js'
import { validate } from '../../common/decorators/validate.js'
import {
  createCompanySchema, updateCompanySchema, updateCompanyModulesSchema,
  deleteCompanySchema, migratePlanSchema, createInvoiceSchema,
  createCalendarEventSchema, updateFeatureFlagSchema,
} from './super-admin.validation.js'

const router = Router()

router.use(superAdminAuth)

router.get('/companies', superAdminController.getCompanies)
router.get('/companies/:id', superAdminController.getCompany)
router.post('/companies', validate(createCompanySchema), superAdminController.createCompany)
router.put('/companies/:id', validate(updateCompanySchema), superAdminController.updateCompany)
router.delete('/companies/:id', validate(deleteCompanySchema), superAdminController.deleteCompany)
router.put('/companies/:id/modules', validate(updateCompanyModulesSchema), superAdminController.updateModules)
router.post('/companies/:id/resend-credentials', superAdminController.resendCredentials)
router.post('/companies/:id/migrate-plan', validate(migratePlanSchema), superAdminController.migratePlan)
router.post('/companies/:id/toggle-status', superAdminController.toggleTenantStatus)

router.get('/dashboard', superAdminController.getDashboardMetrics)

router.get('/invoices', superAdminController.getInvoices)
router.put('/invoices/:id/mark-paid', superAdminController.markInvoicePaid)
router.post('/invoices', validate(createInvoiceSchema), superAdminController.createManualInvoice)

router.get('/calendar', superAdminController.getCalendarEvents)
router.post('/calendar', validate(createCalendarEventSchema), superAdminController.createCalendarEvent)
router.delete('/calendar/:id', superAdminController.deleteCalendarEvent)

router.get('/audit-logs', superAdminController.getAuditLogs)
router.get('/plans', superAdminController.getPlans)
router.get('/health', superAdminController.getSystemHealth)
router.post('/announcements', superAdminController.createAnnouncement)

router.get('/features', superAdminController.getFeatureFlags)
router.put('/features', validate(updateFeatureFlagSchema), superAdminController.updateFeatureFlag)
router.put('/features/toggle-all', superAdminController.toggleAllFeatureFlags)

export { router as superAdminRouter }
