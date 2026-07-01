import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebsocket } from './use-websocket'

export function useRealtimeOrders() {
  const { subscribe } = useWebsocket()
  const queryClient = useQueryClient()
  const subscribed = useRef(false)

  useEffect(() => {
    if (subscribed.current) return
    subscribed.current = true

    const unsub1 = subscribe('order.created', () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] })
    })
    const unsub2 = subscribe('order.status_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] })
    })

    return () => {
      unsub1()
      unsub2()
      subscribed.current = false
    }
  }, [subscribe, queryClient])
}

export function useRealtimeTables() {
  const { subscribe } = useWebsocket()
  const queryClient = useQueryClient()
  const subscribed = useRef(false)

  useEffect(() => {
    if (subscribed.current) return
    subscribed.current = true

    const unsub = subscribe('order.created', () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'tables'] })
    })

    return () => {
      unsub()
      subscribed.current = false
    }
  }, [subscribe, queryClient])
}