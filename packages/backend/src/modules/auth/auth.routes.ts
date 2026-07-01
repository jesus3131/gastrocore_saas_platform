import { Router } from 'express'
import { AuthController } from './auth.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { superAdminAuth } from '../super-admin/super-admin.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { loginSchema, superAdminLoginSchema, registerSchema, updateProfileSchema, changePasswordSchema } from './auth.validation.js'

const router = Router()
const controller = new AuthController()

// Level 1 — Super Admin login (no tenant)
router.post('/super-admin/login', validate(superAdminLoginSchema), controller.superAdminLogin.bind(controller))

// Level 2+3 — Standard login (tenant-scoped users)
router.post('/login', validate(loginSchema), controller.login.bind(controller))

router.get('/ping', (_req, res) => {
  res.json({ success: true, data: { message: 'pong' } })
})

// Only Super Admin can create new tenants
router.post('/register', superAdminAuth, validate(registerSchema), controller.register.bind(controller))

router.post('/refresh', controller.refresh.bind(controller))
router.post('/logout', authGuard, controller.logout.bind(controller))
router.get('/me', authGuard, controller.me.bind(controller))
router.put('/profile', authGuard, validate(updateProfileSchema), controller.updateProfile.bind(controller))
router.put('/change-password', authGuard, validate(changePasswordSchema), controller.changePassword.bind(controller))

export { router as authRouter }
