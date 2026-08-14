import Redis from 'ioredis';
import { logger } from './logger';

export const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redisClient.on('connect', () => logger.info('Redis connecting...'));
redisClient.on('ready', () => logger.info('Redis ready'));
redisClient.on('error', (err) => logger.error('Redis error:', err));
redisClient.on('close', () => logger.warn('Redis connection closed'));

// ─── Cache helpers ─────────────────────────────────────────────────────────────

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redisClient.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function deleteCache(key: string): Promise<void> {
  await redisClient.del(key);
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(...keys);
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
