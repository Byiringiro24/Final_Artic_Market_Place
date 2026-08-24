'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Truck, Globe, Save, Loader2, X, PlusCircle } from 'lucide-react';
import { get, post, put, del } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShippingRate {
  id: string; name: string; type: string; price: number;
  minOrderValue?: number; estimatedDays: string; isActive: boolean;
}
interface ShippingZone {
  id: string; name: string; countries: string[]; isActive: boolean;
  rates: ShippingRate[];
}

const RATE_TYPE_OPTIONS = [
  { value: 'FLAT', label: 'Flat Rate' },
  { value: 'FREE', label: 'Free Shipping' },
  { value: 'WEIGHT_BASED', label: 'Weight-based' },
  { value: 'ORDER_VALUE_BASED', label: 'Order value-based' },
];

const RATE_TYPE_COLORS: Record<string, string> = {
  FLAT: 'bg-blue-100 text-blue-700',
  FREE: 'bg-green-100 text-green-700',
  WEIGHT_BASED: 'bg-orange-100 text-orange-700',
  ORDER_VALUE_BASED: 'bg-purple-100 text-purple-700',
};

const emptyRate = () => ({
  name: '', type: 'FLAT', price: 0, minOrderValue: 0,
  estimatedDays: '3-5', isActive: true,
});

const emptyZone = () => ({
  name: '', countries: '', isActive: true,
  rates: [emptyRate()],
});

export default function AdminShippingPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [form, setForm] = useState(emptyZone());
  const [saving, setSaving] = useState(false);
  const [addingRateToZoneId, setAddingRateToZoneId] = useState<string | null>(null);
  const [newRate, setNewRate] = useState(emptyRate());

  const { data, isLoading } = useQuery({
    queryKey: ['admin-shipping-zones'],
    queryFn: () => get<ShippingZone[]>('/shipping/zones'),
    select: (r) => r.data,
  });

  const zones = (data as unknown as ShippingZone[]) || [];

  function openCreate() {
    setEditingZone(null);
    setForm(emptyZone());
    setShowForm(true);
  }

  function openEdit(zone: ShippingZone) {
    setEditingZone(zone);
    setForm({
      name: zone.name,
      countries: zone.countries.join(', '),
      isActive: zone.isActive,
      rates: zone.rates.map((r) => ({
        name: r.name, type: r.type,
        price: r.price, minOrderValue: r.minOrderValue || 0,
        estimatedDays: r.estimatedDays, isActive: r.isActive,
      })),
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        countries: form.countries.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean),
        isActive: form.isActive,
        rates: form.rates
          .filter((r) => r.name.trim())
          .map((r) => ({ ...r, price: Number(r.price), minOrderValue: Number(r.minOrderValue) })),
      };
      if (editingZone) {
        await put(`/shipping/zones/${editingZone.id}`, payload);
        toast({ title: 'Shipping zone updated' });
      } else {
        await post('/shipping/zones', payload);
        toast({ title: 'Shipping zone created' });
      }
      qc.invalidateQueries({ queryKey: ['admin-shipping-zones'] });
      setShowForm(false); setEditingZone(null);
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  const { mutate: deleteZone } = useMutation({
    mutationFn: (id: string) => del(`/shipping/zones/${id}`),
    onSuccess: () => { toast({ title: 'Zone removed' }); qc.invalidateQueries({ queryKey: ['admin-shipping-zones'] }); },
    onError: () => toast({ title: 'Delete failed', variant: 'destructive' }),
  });

  const { mutate: addRate, isPending: addingRate } = useMutation({
    mutationFn: ({ zoneId, rate }: { zoneId: string; rate: typeof newRate }) =>
      post(`/shipping/zones/${zoneId}/rates`, { ...rate, price: Number(rate.price), minOrderValue: Number(rate.minOrderValue) }),
    onSuccess: () => {
      toast({ title: 'Rate added' });
      qc.invalidateQueries({ queryKey: ['admin-shipping-zones'] });
      setAddingRateToZoneId(null);
      setNewRate(emptyRate());
    },
    onError: () => toast({ title: 'Failed to add rate', variant: 'destructive' }),
  });

  function updateFormRate(idx: number, field: string, value: string | number | boolean) {
    const updated = [...form.rates];
    (updated[idx] as Record<string, unknown>)[field] = value;
    setForm({ ...form, rates: updated });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-artic-teal" /> Shipping Zones & Rates
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage shipping regions and delivery pricing
          </p>
        </div>
        <Button onClick={openCreate} className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-lg gap-2">
          <Plus className="h-4 w-4" /> Add Zone
        </Button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              {editingZone ? `Edit Zone: ${editingZone.name}` : 'New Shipping Zone'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingZone(null); }} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Zone Name *</Label>
              <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. East Africa, United States" />
            </div>
            <div>
              <Label>Countries (ISO codes, comma-separated)</Label>
              <Input className="mt-1" value={form.countries}
                onChange={(e) => setForm({ ...form, countries: e.target.value })}
                placeholder="RW, KE, UG, TZ (leave empty = rest of world)" />
              <p className="text-xs text-gray-400 mt-1">RW=Rwanda, KE=Kenya, US=USA, GB=UK…</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="zone-active" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <label htmlFor="zone-active" className="text-sm cursor-pointer">Zone is active</label>
          </div>

          {/* Rates section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">Shipping Rates</h3>
              <button type="button"
                onClick={() => setForm({ ...form, rates: [...form.rates, emptyRate()] })}
                className="text-xs text-artic-teal hover:underline flex items-center gap-1">
                <PlusCircle className="h-3.5 w-3.5" /> Add rate
              </button>
            </div>
            <div className="space-y-3">
              {form.rates.map((rate, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50 space-y-3 relative">
                  <button type="button" onClick={() => setForm({ ...form, rates: form.rates.filter((_, i) => i !== idx) })}
                    disabled={form.rates.length === 1}
                    className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-400 disabled:opacity-20">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Rate Name</label>
                      <Input className="mt-1 h-8 text-sm" value={rate.name}
                        onChange={(e) => updateFormRate(idx, 'name', e.target.value)}
                        placeholder="e.g. Standard Shipping" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Type</label>
                      <select value={rate.type} onChange={(e) => updateFormRate(idx, 'type', e.target.value)}
                        className="w-full mt-1 h-8 border rounded-md px-2 text-sm bg-white">
                        {RATE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Price {rate.type === 'FREE' ? '($0 forced)' : '($)'}
                      </label>
                      <Input type="number" min="0" step="0.01" className="mt-1 h-8 text-sm"
                        value={rate.type === 'FREE' ? 0 : rate.price}
                        disabled={rate.type === 'FREE'}
                        onChange={(e) => updateFormRate(idx, 'price', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Est. Delivery (days)</label>
                      <Input className="mt-1 h-8 text-sm" value={rate.estimatedDays}
                        onChange={(e) => updateFormRate(idx, 'estimatedDays', e.target.value)}
                        placeholder="3-5" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Min. Order Value ($)</label>
                      <Input type="number" min="0" className="mt-1 h-8 text-sm"
                        value={rate.minOrderValue}
                        onChange={(e) => updateFormRate(idx, 'minOrderValue', e.target.value)}
                        placeholder="0 = no minimum" />
                    </div>
                    <div className="flex items-center gap-2 mt-5">
                      <input type="checkbox" id={`rate-active-${idx}`} checked={rate.isActive}
                        onChange={(e) => updateFormRate(idx, 'isActive', e.target.checked)} />
                      <label htmlFor={`rate-active-${idx}`} className="text-sm cursor-pointer">Active</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}
              className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-lg gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingZone ? 'Update Zone' : 'Create Zone'}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingZone(null); }} className="rounded-lg">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Zones list */}
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-lg" />)
      ) : zones.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-lg text-gray-500">
          <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No shipping zones yet</p>
          <p className="text-sm mt-1">Add your first zone to configure delivery rates</p>
          <Button onClick={openCreate} className="mt-4 bg-artic-teal text-black rounded-lg gap-2">
            <Plus className="h-4 w-4" /> Add First Zone
          </Button>
        </div>
      ) : (
        zones.map((zone) => (
          <div key={zone.id} className={`bg-white border rounded-lg overflow-hidden ${!zone.isActive ? 'opacity-60' : ''}`}>
            {/* Zone header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-artic-teal flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{zone.name}</h2>
                    {!zone.isActive && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  {zone.countries.length > 0 ? (
                    <p className="text-xs text-gray-500">Countries: {zone.countries.join(', ')}</p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Applies to all other countries</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(zone)}
                  className="p-1.5 text-gray-400 hover:text-artic-teal rounded" title="Edit zone">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => { if (confirm(`Delete zone "${zone.name}"?`)) deleteZone(zone.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Delete zone">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Rates table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b">
                    <th className="text-left px-5 py-2">Rate Name</th>
                    <th className="text-left px-5 py-2">Type</th>
                    <th className="text-right px-5 py-2">Price</th>
                    <th className="text-right px-5 py-2">Min. Order</th>
                    <th className="text-center px-5 py-2">Est. Delivery</th>
                    <th className="text-center px-5 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {zone.rates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-4 text-center text-gray-400 text-xs">
                        No rates — add one below
                      </td>
                    </tr>
                  ) : zone.rates.map((rate) => (
                    <tr key={rate.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">{rate.name}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${RATE_TYPE_COLORS[rate.type] || 'bg-gray-100 text-gray-600'}`}>
                          {rate.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {rate.type === 'FREE' || rate.price === 0
                          ? <span className="text-green-600 font-semibold">FREE</span>
                          : formatPrice(rate.price)}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500">
                        {rate.minOrderValue && rate.minOrderValue > 0 ? formatPrice(rate.minOrderValue) : '—'}
                      </td>
                      <td className="px-5 py-3 text-center text-gray-500">{rate.estimatedDays} days</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rate.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick add rate */}
            {addingRateToZoneId === zone.id ? (
              <div className="border-t px-5 py-4 bg-gray-50 space-y-3">
                <p className="text-sm font-medium">Add Rate to {zone.name}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Name</label>
                    <Input className="mt-1 h-8 text-sm" value={newRate.name}
                      onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                      placeholder="e.g. Express" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Type</label>
                    <select value={newRate.type} onChange={(e) => setNewRate({ ...newRate, type: e.target.value })}
                      className="w-full mt-1 h-8 border rounded-md px-2 text-sm bg-white">
                      {RATE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Price ($)</label>
                    <Input type="number" min="0" step="0.01" className="mt-1 h-8 text-sm"
                      disabled={newRate.type === 'FREE'}
                      value={newRate.type === 'FREE' ? 0 : newRate.price}
                      onChange={(e) => setNewRate({ ...newRate, price: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Est. Days</label>
                    <Input className="mt-1 h-8 text-sm" value={newRate.estimatedDays}
                      onChange={(e) => setNewRate({ ...newRate, estimatedDays: e.target.value })}
                      placeholder="3-5" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Min. Order ($)</label>
                    <Input type="number" min="0" className="mt-1 h-8 text-sm"
                      value={newRate.minOrderValue}
                      onChange={(e) => setNewRate({ ...newRate, minOrderValue: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => addRate({ zoneId: zone.id, rate: newRate })}
                    disabled={addingRate || !newRate.name.trim()}
                    className="bg-artic-teal text-black rounded-lg text-sm h-8 gap-1">
                    {addingRate ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                    Add Rate
                  </Button>
                  <Button variant="outline" onClick={() => { setAddingRateToZoneId(null); setNewRate(emptyRate()); }}
                    className="rounded-lg text-sm h-8">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="border-t px-5 py-3">
                <button onClick={() => { setAddingRateToZoneId(zone.id); setNewRate(emptyRate()); }}
                  className="text-xs text-artic-teal hover:underline flex items-center gap-1">
                  <PlusCircle className="h-3.5 w-3.5" /> Add rate to this zone
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
