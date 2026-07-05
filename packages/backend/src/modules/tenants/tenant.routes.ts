import { Router } from 'express'
import { tenantController } from './tenant.controller.js'
import { authGuard, requireTenantAdmin } from '../../common/guards/auth.guard.js'
import { requirePermission, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { updateTenantConfigSchema, updateFeaturesSchema } from './tenant.validation.js'

const router = Router()

router.use(authGuard)
router.get('/config', requirePermission('tenants:read'), tenantController.getConfig)
router.put('/config', requireTenantAdmin, requireFullAuth, validate(updateTenantConfigSchema), tenantController.updateConfig)
router.get('/features', requirePermission('tenants:read'), tenantController.getFeatures)
router.put('/features', requireTenantAdmin, requireFullAuth, validate(updateFeaturesSchema), tenantController.updateFeatures)

export { router as tenantRouter }
