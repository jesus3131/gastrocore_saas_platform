import { useEffect, useRef, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '../store/auth.store'

type EventHandler = (data: any) => void

export function useWebsocket() {
  const socketRef = useRef<Socket | null>(null)
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map())
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const tokens = useAuthStore((s) => s.tokens)

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) return

    const socket = io({
      auth: { token: tokens.accessToken },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {})
    socket.on('disconnect', () => {})

    socket.onAny((eventName: string, data: any) => {
      const handlers = handlersRef.current.get(eventName)
      if (handlers) {
        handlers.forEach((fn) => fn(data))
      }
    })

    socketRef.current = socket

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [isAuthenticated, tokens?.accessToken])

  const subscribe = useCallback((event: string, handler: EventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set())
    }
    handlersRef.current.get(event)!.add(handler)

    return () => {
      handlersRef.current.get(event)?.delete(handler)
    }
  }, [])

  return { subscribe, socket: socketRef }
}
