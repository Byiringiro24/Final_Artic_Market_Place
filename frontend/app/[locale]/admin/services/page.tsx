'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, EyeOff, Wrench } from 'lucide-react';
import { get, del, post, put } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Service {
  id: string; title: string; slug: string; category: string;
  price?: number; priceType: string; isActive: boolean; isFeatured: boolean;
  shortDesc?: string; description: string; images: string[];
}

const CATEGORIES = ['Photography', 'Logistics', 'Consulting', 'Branding', 'Technology', 'Marketing', 'Finance', 'Legal', 'Other'];
const PRICE_TYPES = ['fixed', 'hourly', 'quote'];

export default function AdminServicesPage() {
  const locale = useLocale();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({
    title: '', category: 'Other', priceType: 'fixed', price: '',
    shortDesc: '', description: '', images: '', isActive: true, isFeatured: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => get<Service[]>('/services/admin/all'),
    select: (r) => r.data,
  });

  const services = (data as unknown as Service[]) || [];

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        images: form.images ? form.images.split('\n').map((u) => u.trim()).filter(Boolean) : [],
      };
      return editing ? put(`/services/${editing.id}`, payload) : post('/services', payload);
    },
    onSuccess: () => {
      toast({ title: editing ? 'Service updated' : 'Service created' });
      qc.invalidateQueries({ queryKey: ['admin-services'] });
      setShowForm(false); setEditing(null);
      setForm({ title: '', category: 'Other', priceType: 'fixed', price: '', shortDesc: '', description: '', images: '', isActive: true, isFeatured: false });
    },
    onError: () => toast({ title: 'Failed to save', variant: 'destructive' }),
  });

  const { mutate: deleteService } = useMutation({
    mutationFn: (id: string) => del(`/services/${id}`),
    onSuccess: () => { toast({ title: 'Deleted' }); qc.invalidateQueries({ queryKey: ['admin-services'] }); },
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => put(`/services/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  function openEdit(s: Service) {
    setEditing(s);
    setForm({
      title: s.title, category: s.category, priceType: s.priceType,
      price: s.price?.toString() || '', shortDesc: s.shortDesc || '',
      description: s.description, images: s.images.join('\n'),
      isActive: s.isActive, isFeatured: s.isFeatured,
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6 text-artic-teal" /> Services
        </h1>
        <Button onClick={() => { setEditing(null); setShowForm(!showForm); }}
          className="bg-artic-teal hover:bg-artic-teal-dark text-white rounded-lg gap-2">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit Service' : 'New Service'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div>
              <Label>Category</Label>
              <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Pricing Type</Label>
              <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm" value={form.priceType} onChange={(e) => setForm({ ...form, priceType: e.target.value })}>
                {PRICE_TYPES.map((t) => <option key={t} value={t}>{t === 'fixed' ? 'Fixed Price' : t === 'hourly' ? 'Hourly Rate' : 'Custom Quote'}</option>)}
              </select>
            </div>
            {form.priceType !== 'quote' && (
              <div><Label>Price ($)</Label><Input type="number" min="0" step="0.01" className="mt-1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            )}
            <div className="sm:col-span-2"><Label>Short Description</Label><Input className="mt-1" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} placeholder="One-line summary" /></div>
            <div className="sm:col-span-2">
              <Label>Full Description (Markdown)</Label>
              <textarea rows={5} className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal resize-y"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="## Service Title&#10;&#10;Describe what you offer..." />
            </div>
            <div className="sm:col-span-2">
              <Label>Image / Video URLs (one per line)</Label>
              <textarea rows={3} className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal resize-none font-mono"
                value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://example.com/image1.jpg&#10;https://example.com/video.mp4" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active (visible to customers)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Featured
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => save()} disabled={!form.title || !form.category || isPending}
              className="bg-artic-teal text-white rounded-lg">
              {isPending ? 'Saving...' : editing ? 'Update Service' : 'Create Service'}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-lg">Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Service</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Price</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>{[1,2,3,4,5].map((j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>
            )) : services.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-500">No services yet. Add your first one!</td></tr>
            ) : services.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-artic-teal/10 rounded-lg flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-artic-teal" />
                    </div>
                    <div>
                      <p className="font-medium">{s.title}</p>
                      {s.shortDesc && <p className="text-xs text-gray-400 truncate max-w-[200px]">{s.shortDesc}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-xs bg-artic-teal/10 text-artic-teal px-2 py-0.5 rounded-full">{s.category}</span></td>
                <td className="px-4 py-3 text-sm">
                  {s.priceType === 'quote' ? <span className="text-gray-500 italic">Quote</span> :
                   s.priceType === 'hourly' ? `$${s.price}/hr` : s.price ? `$${s.price}` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive({ id: s.id, isActive: !s.isActive })}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/${locale}/services/${s.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-artic-teal rounded" title="Preview"><Eye className="h-4 w-4" /></Link>
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-artic-teal rounded" title="Edit"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm('Delete this service?')) deleteService(s.id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
