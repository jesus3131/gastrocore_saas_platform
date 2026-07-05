import { Router } from 'express'
import { subscriptionController } from './subscription.controller.js'
import { authGuard, requireTenantAdmin } from '../../common/guards/auth.guard.js'
import { requirePermission, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { changePlanSchema } from './subscription.validation.js'

const router = Router()

router.use(authGuard)

router.get('/plans', requirePermission('tenants:read'), subscriptionController.getPlans)
router.get('/current', requirePermission('tenants:read'), subscriptionController.getCurrentSubscription)
router.post('/change', requireTenantAdmin, requireFullAuth, validate(changePlanSchema), subscriptionController.changePlan)
router.get('/invoices', requirePermission('tenants:read'), subscriptionController.getInvoices)

export { router as subscriptionRouter }
