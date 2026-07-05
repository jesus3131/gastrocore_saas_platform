import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authController } from './auth.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { superAdminAuth } from '../super-admin/super-admin.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { loginSchema, superAdminLoginSchema, registerSchema, updateProfileSchema, changePasswordSchema, refreshTokenSchema } from './auth.validation.js'

const router = Router()
const refreshLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false })

router.post('/super-admin/login', validate(superAdminLoginSchema), authController.superAdminLogin)
router.post('/login', validate(loginSchema), authController.login)
router.get('/ping', (_req, res) => { res.json({ success: true, data: { message: 'pong' } }) })
router.post('/register', superAdminAuth, validate(registerSchema), authController.register)
router.post('/refresh', refreshLimiter, validate(refreshTokenSchema), authController.refresh)
router.post('/logout', authGuard, authController.logout)
router.get('/me', authGuard, authController.me)
router.put('/profile', authGuard, validate(updateProfileSchema), authController.updateProfile)
router.put('/change-password', authGuard, validate(changePasswordSchema), authController.changePassword)

export { router as authRouter }
