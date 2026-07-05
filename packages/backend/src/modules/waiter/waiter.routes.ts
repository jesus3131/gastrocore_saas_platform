import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { waiterController } from './waiter.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requireRole } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { waiterLoginSchema, waiterPinLoginSchema, createWaiterOrderSchema, waiterPaymentSchema } from './waiter.validation.js'

const router = Router()
const loginLimiter = rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false })
const publicLimiter = rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false })

router.post('/auth/login', loginLimiter, validate(waiterLoginSchema), waiterController.login)
router.post('/auth/login-pin', loginLimiter, validate(waiterPinLoginSchema), waiterController.loginWithPin)
router.get('/tenants', publicLimiter, waiterController.listTenants)
router.use(authGuard)
router.use(requireRole('waiter'))
router.get('/menu', waiterController.getMenu)
router.get('/tables', waiterController.getTables)
router.post('/orders', validate(createWaiterOrderSchema), waiterController.createOrder)
router.post('/tables/:tableId/bill', waiterController.requestBill)
router.post('/tables/:tableId/pay', validate(waiterPaymentSchema), waiterController.processPayment)

export { router as waiterRouter }
