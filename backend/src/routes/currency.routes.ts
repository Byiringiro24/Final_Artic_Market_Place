/**
 * GET /api/v1/currency/rates
 *
 * Returns live exchange rates relative to USD.
 * Source: Open Exchange Rates (free, no-key "latest.json" endpoint) with
 *         exchangerate.host as primary and a hard-coded fallback.
 *
 * Cache strategy:
 *   - Redis cache for 1 hour (rates don't change every minute)
 *   - In-memory fallback when Redis is unavailable
 *   - Static fallback when both upstream APIs fail
 */

import { Router, Request, Response } from 'express';
import { getCache, setCache } from '../lib/redis';
import { ApiResponse } from '../lib/apiResponse';
import logger from '../lib/logger';

const router = Router();

// ─── Supported currencies ─────────────────────────────────────────────────────
export const SUPPORTED = [
  { code: 'USD', symbol: '$',    name: 'US Dollar',          flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',    name: 'Euro',               flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',    name: 'British Pound',      flag: '🇬🇧' },
  { code: 'RWF', symbol: 'RWF',  name: 'Rwandan Franc',      flag: '🇷🇼' },
  { code: 'KES', symbol: 'KSh',  name: 'Kenyan Shilling',    flag: '🇰🇪' },
  { code: 'UGX', symbol: 'USh',  name: 'Ugandan Shilling',   flag: '🇺🇬' },
  { code: 'TZS', symbol: 'TSh',  name: 'Tanzanian Shilling', flag: '🇹🇿' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand', flag: '🇿🇦' },
  { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira',     flag: '🇳🇬' },
  { code: 'CAD', symbol: 'C$',   name: 'Canadian Dollar',    flag: '🇨🇦' },
  { code: 'AED', symbol: 'AED',  name: 'UAE Dirham',         flag: '🇦🇪' },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen',       flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥',    name: 'Chinese Yuan',       flag: '🇨🇳' },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee',       flag: '🇮🇳' },
] as const;

export type SupportedCode = (typeof SUPPORTED)[number]['code'];

// ─── Static fallback rates (updated periodically as last resort) ───────────────
const STATIC_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  RWF: 1350,
  KES: 129,
  UGX: 3700,
  TZS: 2600,
  ZAR: 18.3,
  NGN: 1600,
  CAD: 1.36,
  AED: 3.67,
  JPY: 149,
  CNY: 7.25,
  INR: 83.5,
};

// In-process memory cache as a last resort when Redis is down
let memCache: { rates: Record<string, number>; ts: number } | null = null;
const MEM_TTL_MS = 60 * 60 * 1000; // 1 hour

const REDIS_KEY = 'currency:rates';
const REDIS_TTL = 3600; // 1 hour

// ─── Fetch live rates ─────────────────────────────────────────────────────────
async function fetchLiveRates(): Promise<Record<string, number>> {
  const codes = SUPPORTED.map((c) => c.code).join(',');

  // Primary: exchangerate-api open endpoint (no key required for latest USD base)
  const endpoints = [
    `https://open.er-api.com/v6/latest/USD`,
    `https://api.exchangerate-api.com/v4/latest/USD`,
    `https://api.fxratesapi.com/latest?base=USD&currencies=${codes}&resolution=1m&amount=1&places=6&format=json`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const json = await res.json() as Record<string, unknown>;

      // open.er-api.com / exchangerate-api.com shape: { rates: { EUR: 0.92, ... } }
      if (json.rates && typeof json.rates === 'object') {
        const raw = json.rates as Record<string, number>;
        // Filter to only supported codes + always keep USD=1
        const filtered: Record<string, number> = { USD: 1 };
        SUPPORTED.forEach(({ code }) => {
          if (raw[code] != null) filtered[code] = raw[code];
        });
        logger.info(`Currency rates fetched from ${url}`);
        return filtered;
      }

      // fxratesapi shape: { data: { EUR: { value: 0.92 }, ... } }
      if (json.data && typeof json.data === 'object') {
        const raw = json.data as Record<string, { value: number }>;
        const filtered: Record<string, number> = { USD: 1 };
        SUPPORTED.forEach(({ code }) => {
          if (raw[code]?.value != null) filtered[code] = raw[code].value;
        });
        logger.info(`Currency rates fetched from ${url} (fxratesapi)`);
        return filtered;
      }
    } catch (err: unknown) {
      logger.warn(`Currency fetch failed for ${url}: ${(err as Error).message}`);
    }
  }

  logger.warn('All currency endpoints failed — using static fallback rates');
  return STATIC_RATES;
}

// ─── GET /currency/rates ───────────────────────────────────────────────────────
router.get('/rates', async (_req: Request, res: Response) => {
  // 1. Try Redis cache
  const cached = await getCache<Record<string, number>>(REDIS_KEY);
  if (cached) {
    return ApiResponse.success(res, {
      rates:     cached,
      currencies: SUPPORTED,
      source:    'cache',
      cachedAt:  new Date().toISOString(),
    });
  }

  // 2. Try in-memory cache
  if (memCache && Date.now() - memCache.ts < MEM_TTL_MS) {
    return ApiResponse.success(res, {
      rates:     memCache.rates,
      currencies: SUPPORTED,
      source:    'memory',
      cachedAt:  new Date(memCache.ts).toISOString(),
    });
  }

  // 3. Fetch live
  const rates = await fetchLiveRates();

  // Store in Redis
  await setCache(REDIS_KEY, rates, REDIS_TTL);
  // Store in memory
  memCache = { rates, ts: Date.now() };

  return ApiResponse.success(res, {
    rates,
    currencies: SUPPORTED,
    source:    'live',
    cachedAt:  new Date().toISOString(),
  });
});

// ─── POST /currency/refresh  (admin only, force-refresh cache) ─────────────────
router.post('/refresh', async (_req: Request, res: Response) => {
  memCache = null;
  const rates = await fetchLiveRates();
  await setCache(REDIS_KEY, rates, REDIS_TTL);
  memCache = { rates, ts: Date.now() };
  return ApiResponse.success(res, { rates, message: 'Rates refreshed' });
});

export default router;
