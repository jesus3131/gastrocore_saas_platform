import { Router } from 'express'
import { CrmController } from './crm.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createCustomerSchema, updateCustomerSchema, redeemPointsSchema } from './crm.validation.js'

const router = Router()
const controller = new CrmController()

router.use(authGuard)

router.get('/customers', controller.getCustomers.bind(controller))
router.get('/customers/:id', controller.getCustomer.bind(controller))
router.post('/customers', validate(createCustomerSchema), controller.createCustomer.bind(controller))
router.put('/customers/:id', validate(updateCustomerSchema), controller.updateCustomer.bind(controller))
router.get('/segments', controller.getSegments.bind(controller))
router.get('/loyalty', controller.getLoyaltyProgram.bind(controller))
router.post('/loyalty/redeem', validate(redeemPointsSchema), controller.redeemPoints.bind(controller))
router.get('/rewards', controller.getRewards.bind(controller))

export { router as crmRouter }
