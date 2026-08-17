'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tag } from 'lucide-react';
import { get, del, post } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Promo { id: string; code: string; type: string; value: number; usedCount: number; maxUses?: number; isActive: boolean; endDate?: string }

export default function AdminPromotionsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'PERCENTAGE', value: 0, minOrderAmount: 0, maxUses: '', isActive: true });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-promos'],
    queryFn: () => get<Promo[]>('/promotions'),
    select: (res) => res.data,
  });

  const promos = (data as unknown as Promo[]) || [];

  const { mutate: createPromo, isPending } = useMutation({
    mutationFn: () => post('/promotions', { ...form, maxUses: form.maxUses ? Number(form.maxUses) : null }),
    onSuccess: () => { toast({ title: 'Promotion created' }); qc.invalidateQueries({ queryKey: ['admin-promos'] }); setShowForm(false); },
  });

  const { mutate: deletePromo } = useMutation({
    mutationFn: (id: string) => del(`/promotions/${id}`),
    onSuccess: () => { toast({ title: 'Promotion deleted' }); qc.invalidateQueries({ queryKey: ['admin-promos'] }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promotions & Coupons</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-lg gap-2">
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-5 grid sm:grid-cols-2 gap-4">
          <div><Label>Coupon Code</Label><Input className="mt-1 uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE20" /></div>
          <div><Label>Type</Label>
            <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="PERCENTAGE">Percentage Off</option>
              <option value="FIXED_AMOUNT">Fixed Amount Off</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
          </div>
          <div><Label>Value ({form.type === 'PERCENTAGE' ? '%' : '$'})</Label><Input type="number" className="mt-1" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
          <div><Label>Min Order ($)</Label><Input type="number" className="mt-1" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} /></div>
          <div><Label>Max Uses (blank = unlimited)</Label><Input type="number" className="mt-1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} /></div>
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <Button onClick={() => createPromo()} disabled={!form.code || isPending} className="bg-artic-teal text-black rounded-lg">
              {isPending ? 'Saving...' : 'Create Coupon'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-lg">Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-right px-4 py-3 font-medium">Value</th>
              <th className="text-center px-4 py-3 font-medium">Uses</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>)
            ) : promos.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">No promotions yet</td></tr>
            ) : promos.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-mono font-bold text-artic-teal flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {p.code}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {p.type === 'PERCENTAGE' ? `${p.value}%` : p.type === 'FIXED_AMOUNT' ? formatPrice(p.value) : 'Free shipping'}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{p.usedCount}{p.maxUses ? ` / ${p.maxUses}` : ''}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { if (confirm('Delete this coupon?')) deletePromo(p.id); }} className="p-1.5 text-gray-400 hover:text-red-500" aria-label="Delete coupon">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
