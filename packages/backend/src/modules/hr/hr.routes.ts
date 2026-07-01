import { Router } from 'express'
import { HrController } from './hr.controller.js'
import { authGuard, tenantGuard, requireTenantAdmin } from '../../common/guards/auth.guard.js'
import { requireRole } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createEmployeeSchema, updateEmployeeSchema, createShiftSchema, updateShiftStatusSchema, verifyPinSchema } from './hr.validation.js'

const router = Router()
const controller = new HrController()

// Public PIN verification for POS employees (requires tenant header but not full auth)
router.post('/employees/verify-pin', tenantGuard, validate(verifyPinSchema), controller.verifyPin.bind(controller))

router.use(authGuard)

// Level 2 — Only Tenant Admin can manage employees
router.get('/employees', controller.getEmployees.bind(controller))
router.post('/employees', requireRole('admin'), requireTenantAdmin, validate(createEmployeeSchema), controller.createEmployee.bind(controller))
router.put('/employees/:id', requireRole('admin'), requireTenantAdmin, validate(updateEmployeeSchema), controller.updateEmployee.bind(controller))

// Shifts — any authenticated tenant user can manage
router.get('/shifts', controller.getShifts.bind(controller))
router.post('/shifts', validate(createShiftSchema), controller.createShift.bind(controller))
router.put('/shifts/:id/status', validate(updateShiftStatusSchema), controller.updateShiftStatus.bind(controller))

router.get('/roles', controller.getRoles.bind(controller))
router.get('/commissions', controller.getCommissions.bind(controller))

export { router as hrRouter }
