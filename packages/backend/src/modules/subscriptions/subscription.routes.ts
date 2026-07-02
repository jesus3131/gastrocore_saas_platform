import { Router } from 'express'
import { SubscriptionController } from './subscription.controller.js'
import { authGuard, requireTenantAdmin } from '../../common/guards/auth.guard.js'
import { requirePermission, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { changePlanSchema } from './subscription.validation.js'

const router = Router()
const controller = new SubscriptionController()

router.use(authGuard)

router.get('/plans', requirePermission('tenants:read'), controller.getPlans.bind(controller))
router.get('/current', requirePermission('tenants:read'), controller.getCurrentSubscription.bind(controller))
router.post('/change', requireTenantAdmin, requireFullAuth, validate(changePlanSchema), controller.changePlan.bind(controller))
router.get('/invoices', requirePermission('tenants:read'), controller.getInvoices.bind(controller))

export { router as subscriptionRouter }
