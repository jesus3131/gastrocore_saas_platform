import { Router } from 'express'
import { SubscriptionController } from './subscription.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { changePlanSchema } from './subscription.validation.js'

const router = Router()
const controller = new SubscriptionController()

router.use(authGuard)

router.get('/plans', controller.getPlans.bind(controller))
router.get('/current', controller.getCurrentSubscription.bind(controller))
router.post('/change', validate(changePlanSchema), controller.changePlan.bind(controller))
router.get('/invoices', controller.getInvoices.bind(controller))

export { router as subscriptionRouter }
