import { Router } from 'express'
import { PosController } from './pos.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createOrderSchema, paymentSchema } from './pos.validation.js'

const router = Router()
const controller = new PosController()

router.use(authGuard)

// Menu
router.get('/menu', requirePermission('pos:read'), controller.getMenu.bind(controller))
router.get('/menu/:categoryId', requirePermission('pos:read'), controller.getMenuItems.bind(controller))

// Tables
router.get('/tables', requirePermission('pos:read'), controller.getTables.bind(controller))
router.put('/tables/:id/status', requirePermission('pos:write'), controller.updateTableStatus.bind(controller))

// Orders
router.get('/orders', requirePermission('pos:read'), controller.getOrders.bind(controller))
router.post('/orders', requirePermission('pos:write'), validate(createOrderSchema), controller.createOrder.bind(controller))
router.get('/orders/:id', requirePermission('pos:read'), controller.getOrder.bind(controller))
router.put('/orders/:id/status', requirePermission('pos:write'), controller.updateOrderStatus.bind(controller))

// Payments
router.post('/payments', requirePermission('pos:write'), validate(paymentSchema), controller.processPayment.bind(controller))
router.post('/payments/split', requirePermission('pos:write'), controller.splitBill.bind(controller))

export { router as posRouter }
