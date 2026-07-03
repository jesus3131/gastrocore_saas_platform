import { Router } from 'express'
import { crmController } from './crm.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createCustomerSchema, updateCustomerSchema, redeemPointsSchema } from './crm.validation.js'

const router = Router()

router.use(authGuard)

router.get('/customers', requirePermission('crm:read'), crmController.getCustomers)
router.get('/customers/:id', requirePermission('crm:read'), crmController.getCustomer)
router.post('/customers', requirePermission('crm:write'), requireFullAuth, validate(createCustomerSchema), crmController.createCustomer)
router.put('/customers/:id', requirePermission('crm:write'), requireFullAuth, validate(updateCustomerSchema), crmController.updateCustomer)
router.get('/segments', requirePermission('crm:read'), crmController.getSegments)
router.get('/loyalty', requirePermission('crm:read'), crmController.getLoyaltyProgram)
router.post('/loyalty/redeem', requirePermission('crm:write'), requireFullAuth, validate(redeemPointsSchema), crmController.redeemPoints)
router.get('/rewards', requirePermission('crm:read'), crmController.getRewards)

export { router as crmRouter }
