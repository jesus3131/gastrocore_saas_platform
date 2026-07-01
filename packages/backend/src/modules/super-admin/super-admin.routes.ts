import { Router } from 'express'
import { SuperAdminController } from './super-admin.controller.js'
import { superAdminAuth } from './super-admin.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createCompanySchema, updateCompanySchema, updateCompanyModulesSchema } from './super-admin.validation.js'

const router = Router()
const controller = new SuperAdminController()

router.use(superAdminAuth)

router.get('/companies', controller.getCompanies.bind(controller))
router.get('/companies/:id', controller.getCompany.bind(controller))
router.post('/companies', validate(createCompanySchema), controller.createCompany.bind(controller))
router.put('/companies/:id', validate(updateCompanySchema), controller.updateCompany.bind(controller))
router.put('/companies/:id/modules', validate(updateCompanyModulesSchema), controller.updateModules.bind(controller))
router.post('/companies/:id/resend-credentials', controller.resendCredentials.bind(controller))

export { router as superAdminRouter }
