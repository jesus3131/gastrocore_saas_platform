import { Router } from 'express'
import { integrationController } from './integration.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import {
  connectDeliverySchema, connectPaymentSchema, updateIntegrationSchema,
  createPaymentIntentSchema, createMpPreferenceSchema, syncMenuSchema,
  deliveryOrderStatusSchema,
} from './integration.validation.js'

const router = Router()

router.get('/delivery', authGuard, integrationController.getDeliveries)
router.post('/delivery', authGuard, validate(connectDeliverySchema), integrationController.connectDelivery)
router.get('/payments', authGuard, integrationController.getPayments)
router.post('/payments', authGuard, validate(connectPaymentSchema), integrationController.connectPayment)
router.put('/:id', authGuard, validate(updateIntegrationSchema), integrationController.toggleIntegration)
router.delete('/:id', authGuard, integrationController.disconnect)

router.post('/payments/create-intent', authGuard, validate(createPaymentIntentSchema), integrationController.createPaymentIntent)
router.post('/payments/confirm', authGuard, integrationController.confirmPayment)
router.post('/payments/create-preference', authGuard, validate(createMpPreferenceSchema), integrationController.createMpPreference)

router.post('/delivery/:provider/webhook', authGuard, integrationController.handleDeliveryWebhook)
router.get('/delivery/:provider/orders', authGuard, integrationController.getDeliveryOrders)
router.put('/delivery/:provider/orders/:orderId/status', authGuard, validate(deliveryOrderStatusSchema), integrationController.updateDeliveryOrderStatus)
router.post('/delivery/:provider/sync-menu', authGuard, validate(syncMenuSchema), integrationController.syncDeliveryMenu)

router.post('/webhooks/stripe', integrationController.handleStripeWebhook)
router.post('/webhooks/mercadopago', integrationController.handleMpNotification)
router.post('/webhooks', integrationController.handleWebhook)

export { router as integrationRouter }
