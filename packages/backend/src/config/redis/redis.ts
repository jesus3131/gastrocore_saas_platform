import Redis from 'ioredis'
import { env } from '../env.js'
import { logger } from '../logger.js'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy() {
        return null
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    })

    redis.on('connect', () => logger.info('Redis connected'))
    redis.on('error', () => {})
  }
  return redis
}

export async function connectRedis() {
  try {
    const client = getRedis()
    await client.connect()
  } catch (err) {
    logger.warn({ err }, 'Redis connection failed, continuing without Redis')
  }
}

export async function disconnectRedis() {
  if (redis) {
    await redis.quit()
    redis = null
  }
}
