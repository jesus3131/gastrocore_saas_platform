import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { AuthService } from './auth.service.js'
import { AppError } from '../../common/filters/error-handler.js'
import { registerDependencies } from '../../infrastructure/di/container.js'
import { wrapAsync } from '../../common/utils/async-handler.js'

class AuthController {
  private static _ensureDi = (() => { registerDependencies(); return true })()
  private service = container.resolve(AuthService)

  async login(req: Request, res: Response) {
    const tenantId = req.headers['x-tenant-id'] as string | undefined
    const result = await this.service.login(req.body.email, req.body.password, tenantId)
    res.json({ success: true, data: result })
  }

  async superAdminLogin(req: Request, res: Response) {
    const result = await this.service.superAdminLogin(req.body.email, req.body.password)
    res.json({ success: true, data: result })
  }

  async register(req: Request, res: Response) {
    const result = await this.service.register(req.body)
    res.status(201).json({ success: true, data: result })
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body
    if (!refreshToken) throw new AppError(400, 'REFRESH_REQUIRED', 'Refresh token required')
    const result = await this.service.refresh(refreshToken)
    res.json({ success: true, data: result })
  }

  async logout(req: Request, res: Response) {
    await this.service.logout(req.user!.sub)
    res.json({ success: true, data: { message: 'Logged out successfully' } })
  }

  async me(req: Request, res: Response) {
    const user = await this.service.getProfile(req.user!.sub)
    res.json({ success: true, data: user })
  }

  async updateProfile(req: Request, res: Response) {
    const user = await this.service.updateProfile(req.user!.sub, req.body)
    res.json({ success: true, data: user })
  }

  async changePassword(req: Request, res: Response) {
    const result = await this.service.changePassword(req.user!.sub, req.body.currentPassword, req.body.newPassword)
    res.json({ success: true, data: result })
  }
}

export const authController = wrapAsync(new AuthController())
export { AuthController }
