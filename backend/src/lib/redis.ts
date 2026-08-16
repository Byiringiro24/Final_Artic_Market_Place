import Redis from 'ioredis';
import { logger } from './logger';

// ─── Create Redis client with graceful fallback ────────────────────────────────
// If Redis is not available, cache operations become no-ops so the app still works.

let redisAvailable = false;

export const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    if (times > 3) {
      // Stop retrying after 3 attempts — Redis is optional
      return null;
    }
    return Math.min(times * 200, 1000);
  },
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
  lazyConnect: true, // Don't connect until first command
  connectTimeout: 3000,
});

redisClient.on('connect', () => logger.info('Redis connecting...'));
redisClient.on('ready', () => {
  redisAvailable = true;
  logger.info('✅ Redis connected');
});
redisClient.on('error', (err) => {
  if (redisAvailable) {
    logger.warn('Redis error (cache disabled):', err.message);
  }
  redisAvailable = false;
});
redisClient.on('close', () => {
  redisAvailable = false;
});

// Try to connect — failure is non-fatal
redisClient.connect().catch(() => {
  logger.warn('⚠️  Redis not available — caching disabled. App continues without cache.');
});

// ─── Cache helpers (no-op when Redis unavailable) ─────────────────────────────

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisAvailable) return null;
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  if (!redisAvailable) return;
  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Silently skip cache writes
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redisAvailable) return;
  try {
    await redisClient.del(key);
  } catch {
    // Silently skip
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  if (!redisAvailable) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch {
    // Silently skip
  }
}

export const CACHE_KEYS = {
  PRODUCTS: 'products:*',
  PRODUCT: (id: string) => `product:${id}`,
  CATEGORIES: 'categories:all',
  BRANDS: 'brands:all',
  SETTINGS: 'settings:all',
  BANNERS: 'banners:active',
  USER_CART: (userId: string) => `cart:${userId}`,
  USER_WISHLIST: (userId: string) => `wishlist:${userId}`,
};
