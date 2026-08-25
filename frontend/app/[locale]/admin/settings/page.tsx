'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save, Loader2, Globe, Mail, CreditCard, Truck,
  Search, Share2, RefreshCw, DollarSign,
} from 'lucide-react';
import { get, put, post } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const SETTING_GROUPS = [
  { id: 'site',     label: 'Site Info',      icon: Globe },
  { id: 'email',    label: 'SMTP / Email',   icon: Mail },
  { id: 'payment',  label: 'Payments',       icon: CreditCard },
  { id: 'shipping', label: 'Shipping',       icon: Truck },
  { id: 'seo',      label: 'SEO',            icon: Search },
  { id: 'social',   label: 'Social Links',   icon: Share2 },
  { id: 'currency', label: 'Currency Rates', icon: DollarSign },
];

interface Setting { key: string; value: unknown; group: string; label?: string }

// ─── Currency tab ─────────────────────────────────────────────────────────────
interface CurrencyAdminData {
  useCustom: boolean;
  customRates: Record<string, number>;
  liveRates: Record<string, number>;
  currencies: Array<{ code: string; symbol: string; name: string; flag: string }>;
}

function CurrencySettings() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [localRates, setLocalRates] = useState<Record<string, string>>({});
  const [useCustom, setUseCustom] = useState<boolean | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-currency-rates'],
    queryFn: () => get<CurrencyAdminData>('/currency/admin-rates'),
    onSuccess: (res) => {
      const d = res.data as unknown as CurrencyAdminData;
      if (useCustom === null) setUseCustom(d.useCustom);
    },
  });

  const d = data?.data as unknown as CurrencyAdminData | undefined;
  const effectiveUseCustom = useCustom ?? d?.useCustom ?? false;

  const { mutate: saveRates, isPending: saving } = useMutation({
    mutationFn: () => {
      // Build final rates: start from live, overlay any custom edits
      const base = d?.liveRates ?? {};
      const merged: Record<string, number> = { ...base };
      Object.entries(localRates).forEach(([code, val]) => {
        const num = parseFloat(val);
        if (!isNaN(num) && num > 0) merged[code] = num;
      });
      return put('/currency/admin-rates', { useCustom: effectiveUseCustom, rates: merged });
    },
    onSuccess: () => {
      toast({ title: effectiveUseCustom ? '✅ Custom rates saved & active' : '✅ Switched to live rates' });
      qc.invalidateQueries({ queryKey: ['admin-currency-rates'] });
      setLocalRates({});
    },
    onError: () => toast({ title: 'Failed to save', variant: 'destructive' }),
  });

  const { mutate: refreshLive, isPending: refreshing } = useMutation({
    mutationFn: () => post('/currency/refresh', {}),
    onSuccess: () => {
      toast({ title: '🔄 Live rates refreshed' });
      qc.invalidateQueries({ queryKey: ['admin-currency-rates'] });
    },
    onError: () => toast({ title: 'Refresh failed', variant: 'destructive' }),
  });

  function getDisplayRate(code: string): string {
    if (localRates[code] !== undefined) return localRates[code];
    const source = effectiveUseCustom ? d?.customRates : d?.liveRates;
    return String(source?.[code] ?? d?.liveRates?.[code] ?? '');
  }

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3,4].map((i) => <div key={i} className="skeleton h-12 rounded" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg mb-1">Currency Rate Settings</h2>
        <p className="text-sm text-gray-500">
          By default, rates are fetched live from open exchange rate APIs.
          Enable custom rates to override them with your own values.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex-1">
          <p className="font-medium text-sm">Use Custom Rates</p>
          <p className="text-xs text-gray-500">
            {effectiveUseCustom
              ? 'Currently using your custom rates. Users will see these prices.'
              : 'Currently using live rates from open.er-api.com (updated hourly).'}
          </p>
        </div>
        <button
          onClick={() => setUseCustom(!effectiveUseCustom)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-artic-teal focus:ring-offset-2 ${
            effectiveUseCustom ? 'bg-artic-teal' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={effectiveUseCustom}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            effectiveUseCustom ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Live rate refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Live Rates</p>
          <p className="text-xs text-gray-500">Fetched from open.er-api.com — free, no API key needed</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshLive()}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Live Rates
        </Button>
      </div>

      <Separator />

      {/* Rate table */}
      <div>
        <p className="text-sm font-medium mb-3">
          {effectiveUseCustom ? 'Custom Rates (editing)' : 'Live Rates (read-only — enable custom to edit)'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(d?.currencies ?? []).map((c) => {
            const liveVal  = d?.liveRates?.[c.code];
            const custVal  = d?.customRates?.[c.code];
            const isDirty  = localRates[c.code] !== undefined;
            const hasDiff  = custVal !== undefined && custVal !== liveVal;

            return (
              <div key={c.code} className="border rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-sm">
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                    <span className="text-gray-400 text-xs">{c.symbol}</span>
                  </span>
                  {hasDiff && !effectiveUseCustom && (
                    <span className="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">custom set</span>
                  )}
                  {effectiveUseCustom && hasDiff && (
                    <span className="text-xs text-artic-teal bg-artic-teal/10 px-1.5 py-0.5 rounded">custom</span>
                  )}
                </div>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={getDisplayRate(c.code)}
                  onChange={(e) => setLocalRates((prev) => ({ ...prev, [c.code]: e.target.value }))}
                  disabled={!effectiveUseCustom}
                  className={`h-8 text-sm font-mono ${isDirty ? 'border-artic-teal ring-1 ring-artic-teal' : ''} ${!effectiveUseCustom ? 'bg-gray-50 text-gray-500' : ''}`}
                  aria-label={`Exchange rate for ${c.code}`}
                />
                {liveVal !== undefined && (
                  <p className="text-[10px] text-gray-400">
                    Live: <span className="font-mono">{liveVal}</span>
                    {custVal !== undefined && custVal !== liveVal && (
                      <> · Custom: <span className="font-mono text-artic-teal">{custVal}</span></>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Button
        onClick={() => saveRates()}
        disabled={saving}
        className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-lg gap-2"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {effectiveUseCustom ? 'Save Custom Rates' : 'Save (Live Rate Mode)'}
      </Button>
    </div>
  );
}

// ─── Main settings page ───────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [activeGroup, setActiveGroup] = useState('site');
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings', activeGroup],
    queryFn: () => get<Setting[]>(`/settings/${activeGroup}`),
    select: (res) => res.data,
    enabled: activeGroup !== 'currency',
  });

  const settings = (data as unknown as Setting[]) || [];

  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: () =>
      put('/settings', settings.map((s) => ({
        key: s.key,
        value: localValues[s.key] !== undefined ? localValues[s.key] : s.value,
        group: s.group,
        label: s.label,
      }))),
    onSuccess: () => toast({ title: 'Settings saved successfully' }),
    onError:   () => toast({ title: 'Failed to save settings', variant: 'destructive' }),
  });

  function getValue(s: Setting): string {
    if (localValues[s.key] !== undefined) return localValues[s.key];
    if (Array.isArray(s.value)) return (s.value as string[]).join(', ');
    return String(s.value ?? '');
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0 space-y-1">
          {SETTING_GROUPS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveGroup(id); setLocalValues({}); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeGroup === id ? 'bg-artic-teal text-black' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 bg-white border rounded-lg p-6">
          {/* Currency tab renders its own UI */}
          {activeGroup === 'currency' ? (
            <CurrencySettings />
          ) : isLoading ? (
            <div className="space-y-4">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-16 rounded" />)}</div>
          ) : settings.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No settings in this group yet.</p>
          ) : (
            <div className="space-y-5">
              <h2 className="font-semibold text-lg capitalize">
                {SETTING_GROUPS.find((g) => g.id === activeGroup)?.label} Settings
              </h2>

              {settings.map((s) => (
                <div key={s.key}>
                  <Label className="capitalize">
                    {s.label || s.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Label>
                  {s.key.includes('password') || s.key.includes('secret') ? (
                    <Input
                      type="password"
                      className="mt-1"
                      value={getValue(s)}
                      onChange={(e) => setLocalValues((v) => ({ ...v, [s.key]: e.target.value }))}
                      placeholder="••••••••••"
                    />
                  ) : (
                    <Input
                      className="mt-1"
                      value={getValue(s)}
                      onChange={(e) => setLocalValues((v) => ({ ...v, [s.key]: e.target.value }))}
                    />
                  )}
                  <p className="text-xs text-gray-400 mt-1 font-mono">{s.key}</p>
                </div>
              ))}

              <Button
                onClick={() => saveSettings()}
                disabled={isPending}
                className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-lg gap-2"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save {SETTING_GROUPS.find((g) => g.id === activeGroup)?.label} Settings
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
