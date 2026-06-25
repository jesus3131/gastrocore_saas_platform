import Redis from 'ioredis'
import { env } from '../env.js'
import { logger } from '../logger.js'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null
        return Math.min(times * 100, 3000)
      },
      lazyConnect: true,
    })

    redis.on('connect', () => logger.info('Redis connected'))
    redis.on('error', (err) => logger.error(err, 'Redis error'))
  }
  return redis
}

export async function connectRedis() {
  const client = getRedis()
  await client.connect()
}

export async function disconnectRedis() {
  if (redis) {
    await redis.quit()
    redis = null
  }
}
