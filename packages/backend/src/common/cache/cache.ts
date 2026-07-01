import { env } from '../../config/env.js'

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<any>>()
const DEFAULT_TTL_MS = 60_000

let globalEnabled = env.NODE_ENV !== 'test'

export function enableCache() { globalEnabled = true }
export function disableCache() { globalEnabled = false }

export function getCache<T>(key: string): T | undefined {
  if (!globalEnabled) return undefined
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.value as T
}

export function setCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  if (!globalEnabled) return
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function clearCache(pattern?: string): void {
  if (!pattern) { store.clear(); return }
  for (const key of store.keys()) {
    if (key.includes(pattern)) store.delete(key)
  }
}

export function withCache<T>(key: string, fn: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const cached = getCache<T>(key)
  if (cached !== undefined) return Promise.resolve(cached)
  return fn().then((result) => { setCache(key, result, ttlMs); return result })
}
