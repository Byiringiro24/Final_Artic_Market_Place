/**
 * ARTIC Marketplace — Multi-currency support
 *
 * Rates are fetched live from the backend (/api/v1/currency/rates) which
 * pulls from open.er-api.com and caches in Redis for 1 hour.
 * Static rates below are the last-resort fallback when the API is unreachable.
 */

// ─── Static metadata (symbol, name, flag) ─────────────────────────────────────
export const CURRENCIES = [
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

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

// ─── Static fallback rates relative to USD ────────────────────────────────────
export const STATIC_RATES: Record<CurrencyCode, number> = {
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

// ─── Whole-number currencies (no decimal places) ──────────────────────────────
const WHOLE_NUMBER_CURRENCIES: Set<string> = new Set([
  'RWF', 'UGX', 'TZS', 'NGN', 'JPY',
]);

// ─── Format a USD amount into any currency ────────────────────────────────────
export function formatCurrency(
  amountUSD: number,
  currencyCode: CurrencyCode = 'USD',
  rates: Partial<Record<CurrencyCode, number>> = {},
): string {
  const meta      = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];
  const rate      = rates[currencyCode] ?? STATIC_RATES[currencyCode] ?? 1;
  const converted = amountUSD * rate;

  if (WHOLE_NUMBER_CURRENCIES.has(currencyCode)) {
    return `${meta.symbol} ${Math.round(converted).toLocaleString()}`;
  }

  // Use Intl.NumberFormat for correct locale-aware formatting
  try {
    return new Intl.NumberFormat('en-US', {
      style:                 'currency',
      currency:              currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  } catch {
    // Intl might not know very rare codes — fallback
    return `${meta.symbol}${converted.toFixed(2)}`;
  }
}

// ─── Fetch live rates from backend ────────────────────────────────────────────
export interface LiveRatesResponse {
  rates:      Record<string, number>;
  currencies: typeof CURRENCIES;
  source:     'cache' | 'memory' | 'live';
  cachedAt:   string;
}

export async function fetchLiveRates(): Promise<Record<CurrencyCode, number>> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  try {
    const res = await fetch(`${apiUrl}/currency/rates`, {
      next:  { revalidate: 3600 },   // Next.js ISR cache for 1 hour
      cache: 'no-store',             // but always check at runtime
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { data: LiveRatesResponse };
    return json.data.rates as Record<CurrencyCode, number>;
  } catch {
    // Return static rates silently on failure
    return { ...STATIC_RATES };
  }
}

// ─── Legacy helpers (kept for backward compat) ────────────────────────────────
export function getDefaultCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD';
  return (localStorage.getItem('artic-currency') as CurrencyCode) || 'USD';
}

export function saveCurrency(code: CurrencyCode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('artic-currency', code);
  }
}
