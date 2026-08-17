'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { get, del, post, put } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Banner { id: string; title: string; subtitle?: string; imageUrl: string; linkUrl?: string; buttonText?: string; isActive: boolean; sortOrder: number }

export default function AdminBannersPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '', buttonText: '', isActive: true, sortOrder: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => get<Banner[]>('/banners/all'),
    select: (res) => res.data,
  });

  const banners = (data as unknown as Banner[]) || [];

  const { mutate: createBanner, isPending } = useMutation({
    mutationFn: () => post('/banners', form),
    onSuccess: () => { toast({ title: 'Banner created' }); qc.invalidateQueries({ queryKey: ['admin-banners'] }); setShowForm(false); },
  });

  const { mutate: deleteBanner } = useMutation({
    mutationFn: (id: string) => del(`/banners/${id}`),
    onSuccess: () => { toast({ title: 'Banner deleted' }); qc.invalidateQueries({ queryKey: ['admin-banners'] }); },
  });

  const { mutate: toggleBanner } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => put(`/banners/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Homepage Banners</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-lg gap-2">
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-5 grid sm:grid-cols-2 gap-4">
          <div><Label>Title</Label><Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Subtitle</Label><Input className="mt-1" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Image URL</Label><Input className="mt-1" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." /></div>
          <div><Label>Link URL</Label><Input className="mt-1" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="/search?..." /></div>
          <div><Label>Button Text</Label><Input className="mt-1" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} placeholder="Shop Now" /></div>
          <div><Label>Sort Order</Label><Input type="number" className="mt-1" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
          <div className="sm:col-span-2 flex gap-3">
            <Button onClick={() => createBanner()} disabled={!form.title || !form.imageUrl || isPending} className="bg-artic-teal text-black rounded-lg">
              {isPending ? 'Saving...' : 'Save Banner'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-lg">Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-lg" />)
        ) : banners.map((banner) => (
          <div key={banner.id} className="bg-white border rounded-lg overflow-hidden">
            <div className="relative h-32 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {banner.imageUrl && <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                <div className="text-white">
                  <p className="font-bold text-sm">{banner.title}</p>
                  {banner.subtitle && <p className="text-xs opacity-90">{banner.subtitle}</p>}
                </div>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">Order: {banner.sortOrder}</span>
              <div className="flex gap-2">
                <button onClick={() => toggleBanner({ id: banner.id, isActive: !banner.isActive })} className={`p-1 rounded ${banner.isActive ? 'text-green-600' : 'text-gray-400'}`} aria-label="Toggle banner">
                  {banner.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => { if (confirm('Delete banner?')) deleteBanner(banner.id); }} className="p-1 text-red-400 hover:text-red-600 rounded" aria-label="Delete banner">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
