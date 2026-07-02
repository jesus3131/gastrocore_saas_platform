import { Router } from 'express'
import { CrmController } from './crm.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createCustomerSchema, updateCustomerSchema, redeemPointsSchema } from './crm.validation.js'

const router = Router()
const controller = new CrmController()

router.use(authGuard)

router.get('/customers', requirePermission('crm:read'), controller.getCustomers.bind(controller))
router.get('/customers/:id', requirePermission('crm:read'), controller.getCustomer.bind(controller))
router.post('/customers', requirePermission('crm:write'), requireFullAuth, validate(createCustomerSchema), controller.createCustomer.bind(controller))
router.put('/customers/:id', requirePermission('crm:write'), requireFullAuth, validate(updateCustomerSchema), controller.updateCustomer.bind(controller))
router.get('/segments', requirePermission('crm:read'), controller.getSegments.bind(controller))
router.get('/loyalty', requirePermission('crm:read'), controller.getLoyaltyProgram.bind(controller))
router.post('/loyalty/redeem', requirePermission('crm:write'), requireFullAuth, validate(redeemPointsSchema), controller.redeemPoints.bind(controller))
router.get('/rewards', requirePermission('crm:read'), controller.getRewards.bind(controller))

export { router as crmRouter }
