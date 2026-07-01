import { Server as SocketIOServer } from 'socket.io'
import type { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from '@gastrocore/shared'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'

interface AuthenticatedSocket {
  tenantId: string
  userId: string
  role: string
}

export class WebSocketGateway {
  private io: SocketIOServer | null = null

  initialize(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.FRONTEND_URL,
        credentials: true,
      },
    })

    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token as string | undefined
      if (!token) return next(new Error('Authentication required'))

      try {
        const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
        ;(socket as any).user = {
          tenantId: payload.tenantId,
          userId: payload.sub,
          role: payload.role,
        } satisfies AuthenticatedSocket
        next()
      } catch {
        next(new Error('Invalid token'))
      }
    })

    this.io.on('connection', (socket) => {
      const user = (socket as any).user as AuthenticatedSocket
      const room = `tenant:${user.tenantId}`
      socket.join(room)
      logger.debug({ tenantId: user.tenantId, socketId: socket.id }, 'WebSocket client connected')

      socket.on('disconnect', () => {
        logger.debug({ tenantId: user.tenantId, socketId: socket.id }, 'WebSocket client disconnected')
      })
    })

    logger.info('WebSocket gateway initialized')
  }

  broadcastToTenant(tenantId: string, eventName: string, data: unknown) {
    if (!this.io) return
    this.io.to(`tenant:${tenantId}`).emit(eventName, data)
  }
}
