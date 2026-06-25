import type { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service.js'
import { AppError } from '../../common/filters/error-handler.js'

export class AuthController {
  private service = new AuthService()

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.login(req.body.email, req.body.password)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.register(req.body)
      res.status(201).json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) throw new AppError(400, 'REFRESH_REQUIRED', 'Refresh token required')
      const result = await this.service.refresh(refreshToken)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.logout(req.user!.sub)
      res.json({ success: true, data: { message: 'Logged out successfully' } })
    } catch (err) { next(err) }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.service.getProfile(req.user!.sub)
      res.json({ success: true, data: user })
    } catch (err) { next(err) }
  }
}
