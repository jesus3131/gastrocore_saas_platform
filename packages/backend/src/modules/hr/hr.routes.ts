import { Router } from 'express'
import { HrController } from './hr.controller.js'
import { authGuard, tenantGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createEmployeeSchema, updateEmployeeSchema, createShiftSchema, updateShiftStatusSchema, verifyPinSchema } from './hr.validation.js'

const router = Router()
const controller = new HrController()

// Public PIN verification for waiters (requires tenant header but not full auth)
router.post('/employees/verify-pin', tenantGuard, validate(verifyPinSchema), controller.verifyPin.bind(controller))

router.use(authGuard)

router.get('/employees', controller.getEmployees.bind(controller))
router.post('/employees', validate(createEmployeeSchema), controller.createEmployee.bind(controller))
router.put('/employees/:id', validate(updateEmployeeSchema), controller.updateEmployee.bind(controller))
router.get('/shifts', controller.getShifts.bind(controller))
router.post('/shifts', validate(createShiftSchema), controller.createShift.bind(controller))
router.put('/shifts/:id/status', validate(updateShiftStatusSchema), controller.updateShiftStatus.bind(controller))
router.get('/roles', controller.getRoles.bind(controller))
router.get('/commissions', controller.getCommissions.bind(controller))

export { router as hrRouter }
