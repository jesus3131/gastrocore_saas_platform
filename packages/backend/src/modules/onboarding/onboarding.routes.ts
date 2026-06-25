import { Router } from 'express'
import { OnboardingController } from './onboarding.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { saveProfileSchema, saveAreasSchema, saveModulesSchema } from './onboarding.validation.js'

const router = Router()
const controller = new OnboardingController()

router.use(authGuard)
router.post('/profile', validate(saveProfileSchema), controller.saveProfile.bind(controller))
router.post('/areas', validate(saveAreasSchema), controller.saveAreas.bind(controller))
router.post('/modules', validate(saveModulesSchema), controller.saveModules.bind(controller))
router.post('/launch', controller.launch.bind(controller))
router.get('/status', controller.getStatus.bind(controller))

export { router as onboardingRouter }
