import { Router } from 'express'
import { HrController } from './hr.controller.js'
import { authGuard, tenantGuard, requireTenantAdmin } from '../../common/guards/auth.guard.js'
import { requirePermission, requireRole, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createEmployeeSchema, updateEmployeeSchema, createShiftSchema, updateShiftStatusSchema, verifyPinSchema } from './hr.validation.js'

const router = Router()
const controller = new HrController()

// Public PIN verification for POS employees (requires tenant header but not full auth)
router.post('/employees/verify-pin', tenantGuard, validate(verifyPinSchema), controller.verifyPin.bind(controller))

router.use(authGuard)

// Level 2 — Only Tenant Admin can manage employees
router.get('/employees', requirePermission('hr:read'), controller.getEmployees.bind(controller))
router.post('/employees', requirePermission('hr:write'), requireTenantAdmin, requireFullAuth, validate(createEmployeeSchema), controller.createEmployee.bind(controller))
router.put('/employees/:id', requirePermission('hr:write'), requireTenantAdmin, requireFullAuth, validate(updateEmployeeSchema), controller.updateEmployee.bind(controller))
router.delete('/employees/:id', requirePermission('hr:delete'), requireTenantAdmin, requireFullAuth, controller.deleteEmployee.bind(controller))

// Shifts — any authenticated tenant user can manage
router.get('/shifts', requirePermission('hr:read'), controller.getShifts.bind(controller))
router.post('/shifts', requirePermission('hr:write'), validate(createShiftSchema), controller.createShift.bind(controller))
router.put('/shifts/:id/status', requirePermission('hr:write'), validate(updateShiftStatusSchema), controller.updateShiftStatus.bind(controller))

router.get('/roles', requirePermission('hr:read'), controller.getRoles.bind(controller))
router.get('/commissions', requirePermission('hr:read'), controller.getCommissions.bind(controller))

export { router as hrRouter }
