'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, Loader2, Globe, Mail, CreditCard, Truck, Search, Share2 } from 'lucide-react';
import { get, put } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SETTING_GROUPS = [
  { id: 'site', label: 'Site Info', icon: Globe },
  { id: 'email', label: 'SMTP / Email', icon: Mail },
  { id: 'payment', label: 'Payments', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'social', label: 'Social Links', icon: Share2 },
];

interface Setting { key: string; value: unknown; group: string; label?: string }

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [activeGroup, setActiveGroup] = useState('site');
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings', activeGroup],
    queryFn: () => get<Setting[]>(`/settings/${activeGroup}`),
    select: (res) => res.data,
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
    onError: () => toast({ title: 'Failed to save settings', variant: 'destructive' }),
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
              onClick={() => setActiveGroup(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeGroup === id ? 'bg-artic-orange text-black' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </aside>

        {/* Form */}
        <div className="flex-1 bg-white border rounded-lg p-6">
          {isLoading ? (
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
                className="bg-artic-orange hover:bg-artic-orange-dark text-black rounded-lg gap-2"
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
