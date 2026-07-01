import { env } from '../../config/env.js'
import { getRedis } from '../../config/redis/redis.js'

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const memoryStore = new Map<string, CacheEntry<any>>()
const DEFAULT_TTL_MS = 60_000

let globalEnabled = env.NODE_ENV !== 'test'

export function enableCache() { globalEnabled = true }
export function disableCache() { globalEnabled = false }

async function redisGet(key: string): Promise<string | null> {
  try {
    const r = getRedis()
    if (r.status !== 'ready') return null
    return await r.get(key)
  } catch {
    return null
  }
}

async function redisSet(key: string, value: string, ttlMs: number): Promise<void> {
  try {
    const r = getRedis()
    if (r.status !== 'ready') return
    await r.set(key, value, 'PX', ttlMs)
  } catch {}
}

export async function getCache<T>(key: string): Promise<T | undefined> {
  if (!globalEnabled) return undefined
  const raw = await redisGet(key)
  if (raw !== null) {
    try { return JSON.parse(raw) as T } catch {}
  }
  const entry = memoryStore.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key)
    return undefined
  }
  return entry.value as T
}

export async function setCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
  if (!globalEnabled) return
  const serialized = JSON.stringify(value)
  await redisSet(key, serialized, ttlMs)
  memoryStore.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function clearCache(pattern?: string): void {
  if (!pattern) { memoryStore.clear(); return }
  for (const key of memoryStore.keys()) {
    if (key.includes(pattern)) memoryStore.delete(key)
  }
}

export async function withCache<T>(key: string, fn: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const cached = await getCache<T>(key)
  if (cached !== undefined) return cached
  const result = await fn()
  await setCache(key, result, ttlMs)
  return result
}
