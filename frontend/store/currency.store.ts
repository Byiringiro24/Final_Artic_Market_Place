/**
 * Currency store — Zustand + persist
 *
 * On first load it fetches live rates from /api/v1/currency/rates.
 * While rates are loading, formatPrice() uses static fallback rates so the
 * UI is never blank. Once live rates arrive the store updates reactively.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type CurrencyCode,
  CURRENCIES,
  STATIC_RATES,
  formatCurrency,
  fetchLiveRates,
} from '@/lib/currency';

interface CurrencyStore {
  /** Currently selected currency code */
  currency:   CurrencyCode;
  /** Live rates from backend (null = not yet fetched or failed) */
  rates:      Record<string, number> | null;
  /** true while the first fetch is in progress */
  loading:    boolean;
  /** ISO string of when rates were last fetched */
  fetchedAt:  string | null;

  setCurrency:  (c: CurrencyCode) => void;
  /** Format a USD price into the selected currency */
  format:       (usd: number) => string;
  /** Manually trigger a rates refresh */
  refreshRates: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency:  'USD',
      rates:     null,
      loading:   false,
      fetchedAt: null,

      setCurrency: (currency) => set({ currency }),

      format: (usd: number) => {
        const { currency, rates } = get();
        // Use live rates if available, otherwise static fallback
        const effectiveRates = rates ?? STATIC_RATES;
        return formatCurrency(usd, currency, effectiveRates as Record<CurrencyCode, number>);
      },

      refreshRates: async () => {
        set({ loading: true });
        try {
          const live = await fetchLiveRates();
          set({ rates: live, loading: false, fetchedAt: new Date().toISOString() });
        } catch {
          set({ loading: false });
        }
      },
    }),
    {
      name:    'artic-currency',
      // Only persist the selected currency code — not the rates (fetch fresh on load)
      partialize: (state) => ({ currency: state.currency }),
    },
  ),
);

// ─── Auto-fetch rates on app start (client only) ──────────────────────────────
// Call this once from a root client component (providers.tsx or layout)
export function initCurrencyRates() {
  if (typeof window === 'undefined') return;
  const store = useCurrencyStore.getState();

  // Fetch if never loaded or older than 1 hour
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const stale = !store.fetchedAt || new Date(store.fetchedAt).getTime() < oneHourAgo;
  if (stale && !store.loading) {
    store.refreshRates();
  }
}
