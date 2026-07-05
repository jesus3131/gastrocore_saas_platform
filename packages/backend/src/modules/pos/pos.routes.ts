import { Router } from 'express'
import { posController } from './pos.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createOrderSchema, paymentSchema, confirmPaymentSchema } from './pos.validation.js'

const router = Router()

router.use(authGuard)

router.get('/menu', requirePermission('pos:read'), posController.getMenu)
router.get('/menu/:categoryId', requirePermission('pos:read'), posController.getMenuItems)
router.get('/tables', requirePermission('pos:read'), posController.getTables)
router.put('/tables/:id/status', requirePermission('pos:write'), posController.updateTableStatus)
router.get('/orders', requirePermission('pos:read'), posController.getOrders)
router.post('/orders', requirePermission('pos:write'), validate(createOrderSchema), posController.createOrder)
router.get('/orders/:id', requirePermission('pos:read'), posController.getOrder)
router.put('/orders/:id/status', requirePermission('pos:write'), posController.updateOrderStatus)
router.post('/payments', requirePermission('pos:write'), validate(paymentSchema), posController.processPayment)
router.post('/payments/confirm', requirePermission('pos:write'), validate(confirmPaymentSchema), posController.confirmPayment)
router.post('/payments/split', requirePermission('pos:write'), posController.splitBill)

export { router as posRouter }
