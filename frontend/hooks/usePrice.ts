/**
 * usePrice — currency-aware price formatting hook
 *
 * Returns a `fmt(usd)` function that converts a USD amount to the
 * currently selected currency using live/static rates from the store.
 *
 * Usage:
 *   const fmt = usePrice();
 *   <span>{fmt(product.price)}</span>
 */
'use client';

import { useCallback } from 'react';
import { useCurrencyStore } from '@/store/currency.store';

export function usePrice() {
  const format = useCurrencyStore((s) => s.format);
  // Wrap in useCallback so referential equality is stable across renders
  return useCallback((usd: number) => format(usd), [format]);
}
