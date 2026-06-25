import { Router } from 'express'
import { TenantController } from './tenant.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { updateTenantConfigSchema, updateFeaturesSchema } from './tenant.validation.js'

const router = Router()
const controller = new TenantController()

router.use(authGuard)
router.get('/config', controller.getConfig.bind(controller))
router.put('/config', validate(updateTenantConfigSchema), controller.updateConfig.bind(controller))
router.get('/features', controller.getFeatures.bind(controller))
router.put('/features', validate(updateFeaturesSchema), controller.updateFeatures.bind(controller))

export { router as tenantRouter }
