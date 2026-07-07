import { Router } from 'express'
import { onboardingController } from './onboarding.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { saveProfileSchema, saveAreasSchema, saveModulesSchema } from './onboarding.validation.js'

const router = Router()

router.use(authGuard)
router.use(requirePermission('onboarding:write'))
router.post('/profile', validate(saveProfileSchema), onboardingController.saveProfile)
router.post('/areas', validate(saveAreasSchema), onboardingController.saveAreas)
router.post('/modules', validate(saveModulesSchema), onboardingController.saveModules)
router.post('/launch', onboardingController.launch)
router.get('/status', onboardingController.getStatus)

export { router as onboardingRouter }
