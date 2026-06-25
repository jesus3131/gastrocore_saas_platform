import { Router } from 'express'
import { PosController } from './pos.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createOrderSchema, paymentSchema } from './pos.validation.js'

const router = Router()
const controller = new PosController()

router.use(authGuard)

// Menu
router.get('/menu', controller.getMenu.bind(controller))
router.get('/menu/:categoryId', controller.getMenuItems.bind(controller))

// Tables
router.get('/tables', controller.getTables.bind(controller))
router.put('/tables/:id/status', controller.updateTableStatus.bind(controller))

// Orders
router.get('/orders', controller.getOrders.bind(controller))
router.post('/orders', validate(createOrderSchema), controller.createOrder.bind(controller))
router.get('/orders/:id', controller.getOrder.bind(controller))
router.put('/orders/:id/status', controller.updateOrderStatus.bind(controller))

// Payments
router.post('/payments', validate(paymentSchema), controller.processPayment.bind(controller))
router.post('/payments/split', controller.splitBill.bind(controller))

export { router as posRouter }
