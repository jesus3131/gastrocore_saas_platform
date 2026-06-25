import { Router } from 'express'
import { AuthController } from './auth.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { loginSchema, registerSchema } from './auth.validation.js'

const router = Router()
const controller = new AuthController()

router.post('/login', validate(loginSchema), controller.login.bind(controller))
router.post('/register', validate(registerSchema), controller.register.bind(controller))
router.post('/refresh', controller.refresh.bind(controller))
router.post('/logout', authGuard, controller.logout.bind(controller))
router.get('/me', authGuard, controller.me.bind(controller))

export { router as authRouter }
