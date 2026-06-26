import { Router } from 'express'
import { IntegrationController } from './integration.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { connectDeliverySchema, connectPaymentSchema, updateIntegrationSchema, webhookSchema } from './integration.validation.js'

const router = Router()
const controller = new IntegrationController()

router.get('/delivery', authGuard, controller.getDeliveries.bind(controller))
router.post('/delivery', authGuard, validate(connectDeliverySchema), controller.connectDelivery.bind(controller))
router.get('/payments', authGuard, controller.getPayments.bind(controller))
router.post('/payments', authGuard, validate(connectPaymentSchema), controller.connectPayment.bind(controller))
router.put('/:id', authGuard, validate(updateIntegrationSchema), controller.toggleIntegration.bind(controller))
router.delete('/:id', authGuard, controller.disconnect.bind(controller))

router.post('/webhooks', validate(webhookSchema), controller.handleWebhook.bind(controller))

export { router as integrationRouter }
