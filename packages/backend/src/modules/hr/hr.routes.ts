import { Router } from 'express'
import { hrController } from './hr.controller.js'
import { authGuard, tenantGuard, requireTenantAdmin } from '../../common/guards/auth.guard.js'
import { requirePermission, requireRole, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createEmployeeSchema, updateEmployeeSchema, createShiftSchema, updateShiftStatusSchema, verifyPinSchema } from './hr.validation.js'

const router = Router()

router.post('/employees/verify-pin', tenantGuard, validate(verifyPinSchema), hrController.verifyPin)
router.use(authGuard)

router.get('/employees', requirePermission('hr:read'), hrController.getEmployees)
router.post('/employees', requirePermission('hr:write'), requireTenantAdmin, requireFullAuth, validate(createEmployeeSchema), hrController.createEmployee)
router.put('/employees/:id', requirePermission('hr:write'), requireTenantAdmin, requireFullAuth, validate(updateEmployeeSchema), hrController.updateEmployee)
router.delete('/employees/:id', requirePermission('hr:delete'), requireTenantAdmin, requireFullAuth, hrController.deleteEmployee)

router.get('/shifts', requirePermission('hr:read'), hrController.getShifts)
router.post('/shifts', requirePermission('hr:write'), validate(createShiftSchema), hrController.createShift)
router.put('/shifts/:id/status', requirePermission('hr:write'), validate(updateShiftStatusSchema), hrController.updateShiftStatus)

router.get('/roles', requirePermission('hr:read'), hrController.getRoles)
router.get('/commissions', requirePermission('hr:read'), hrController.getCommissions)

export { router as hrRouter }
