import { Router } from 'express'
import { SuperAdminController } from './super-admin.controller.js'
import { superAdminAuth } from './super-admin.guard.js'
import { validate } from '../../common/decorators/validate.js'
import {
  createCompanySchema,
  updateCompanySchema,
  updateCompanyModulesSchema,
  deleteCompanySchema,
  migratePlanSchema,
  createInvoiceSchema,
  createCalendarEventSchema,
} from './super-admin.validation.js'

const router = Router()
const controller = new SuperAdminController()

router.use(superAdminAuth)

// Companies
router.get('/companies', controller.getCompanies.bind(controller))
router.get('/companies/:id', controller.getCompany.bind(controller))
router.post('/companies', validate(createCompanySchema), controller.createCompany.bind(controller))
router.put('/companies/:id', validate(updateCompanySchema), controller.updateCompany.bind(controller))
router.delete('/companies/:id', validate(deleteCompanySchema), controller.deleteCompany.bind(controller))
router.put('/companies/:id/modules', validate(updateCompanyModulesSchema), controller.updateModules.bind(controller))
router.post('/companies/:id/resend-credentials', controller.resendCredentials.bind(controller))
router.post('/companies/:id/migrate-plan', validate(migratePlanSchema), controller.migratePlan.bind(controller))
router.post('/companies/:id/toggle-status', controller.toggleTenantStatus.bind(controller))

// Dashboard
router.get('/dashboard', controller.getDashboardMetrics.bind(controller))

// Invoices
router.get('/invoices', controller.getInvoices.bind(controller))
router.put('/invoices/:id/mark-paid', controller.markInvoicePaid.bind(controller))
router.post('/invoices', validate(createInvoiceSchema), controller.createManualInvoice.bind(controller))

// Calendar
router.get('/calendar', controller.getCalendarEvents.bind(controller))
router.post('/calendar', validate(createCalendarEventSchema), controller.createCalendarEvent.bind(controller))
router.delete('/calendar/:id', controller.deleteCalendarEvent.bind(controller))

// Audit
router.get('/audit-logs', controller.getAuditLogs.bind(controller))

// Plans
router.get('/plans', controller.getPlans.bind(controller))

// System Health
router.get('/health', controller.getSystemHealth.bind(controller))

// Announcements
router.post('/announcements', controller.createAnnouncement.bind(controller))

export { router as superAdminRouter }
