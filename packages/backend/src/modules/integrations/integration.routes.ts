import { Router } from 'express'
import { integrationController } from './integration.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { connectDeliverySchema, connectPaymentSchema, updateIntegrationSchema, webhookSchema } from './integration.validation.js'

const router = Router()

router.get('/delivery', authGuard, integrationController.getDeliveries)
router.post('/delivery', authGuard, validate(connectDeliverySchema), integrationController.connectDelivery)
router.get('/payments', authGuard, integrationController.getPayments)
router.post('/payments', authGuard, validate(connectPaymentSchema), integrationController.connectPayment)
router.put('/:id', authGuard, validate(updateIntegrationSchema), integrationController.toggleIntegration)
router.delete('/:id', authGuard, integrationController.disconnect)
router.post('/webhooks', validate(webhookSchema), integrationController.handleWebhook)

export { router as integrationRouter }
