'use client';

import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { useCurrencyStore } from '@/store/currency.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, RefreshCw } from 'lucide-react';

// Group currencies for readability
const GROUPS = [
  {
    label: 'East Africa',
    codes: ['RWF', 'KES', 'UGX', 'TZS'],
  },
  {
    label: 'Global',
    codes: ['USD', 'EUR', 'GBP', 'CAD', 'AED', 'ZAR', 'NGN', 'INR', 'JPY', 'CNY'],
  },
] as const;

export default function CurrencySwitcher() {
  const { currency, setCurrency, loading, rates, fetchedAt, refreshRates } = useCurrencyStore();
  const current = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  // Determine if rates are live or static
  const isLive = rates !== null;

  function formatRate(code: string): string {
    if (!rates) return '';
    const r = rates[code];
    if (r == null) return '';
    if (r >= 1000) return ` · ${Math.round(r).toLocaleString()}`;
    if (r >= 1)    return ` · ${r.toFixed(2)}`;
    return ` · ${r.toFixed(4)}`;
  }

  function getTimeAgo(): string {
    if (!fetchedAt) return '';
    const mins = Math.round((Date.now() - new Date(fetchedAt).getTime()) / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300 hover:text-white
                     transition-colors px-2 py-1 rounded hover:bg-white/10"
          aria-label="Switch currency"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <span className="text-sm">{current.flag}</span>
          )}
          <span className="font-semibold">{current.symbol}</span>
          <span className="hidden lg:inline text-gray-400">{current.code}</span>
          {/* Live rate indicator dot */}
          <span
            className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-400' : 'bg-yellow-400'}`}
            title={isLive ? 'Live rates' : 'Static rates (API unavailable)'}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Header with refresh */}
        <div className="flex items-center justify-between px-2 pt-1.5 pb-1">
          <div>
            <p className="text-xs font-semibold text-gray-700">Currency</p>
            {fetchedAt && (
              <p className="text-[10px] text-gray-400">
                {isLive ? '🟢 Live' : '🟡 Static'} · Updated {getTimeAgo()}
              </p>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); refreshRates(); }}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-artic-teal rounded disabled:opacity-50"
            title="Refresh rates"
            aria-label="Refresh exchange rates"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <DropdownMenuSeparator />

        {GROUPS.map((group) => (
          <div key={group.label}>
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-gray-400 px-2 py-1">
              {group.label}
            </DropdownMenuLabel>
            {group.codes.map((code) => {
              const meta = CURRENCIES.find((c) => c.code === code);
              if (!meta) return null;
              const selected = currency === code;
              return (
                <DropdownMenuItem
                  key={code}
                  onClick={() => setCurrency(code as CurrencyCode)}
                  className={selected ? 'bg-muted font-semibold' : ''}
                >
                  <span className="w-6 text-base">{meta.flag}</span>
                  <span className="w-8 font-mono text-xs text-gray-500">{meta.symbol}</span>
                  <span className="flex-1 text-xs">{meta.name}</span>
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin text-gray-300" />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-mono tabular-nums">
                      {formatRate(code)}
                    </span>
                  )}
                  {selected && <span className="ml-1 text-artic-teal text-xs">✓</span>}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
