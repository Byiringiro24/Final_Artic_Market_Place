'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Wrench, X, Save, Loader2, Star,
} from 'lucide-react';
import { get, del, post, put } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MediaUploadField from '@/components/shared/MediaUploadField';

interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  price?: number;
  priceType: string;
  isActive: boolean;
  isFeatured: boolean;
  shortDesc?: string;
  description: string;
  images: string[];
  videos: string[];
}

const CATEGORIES = [
  'Photography', 'Logistics', 'Consulting', 'Branding',
  'Technology', 'Marketing', 'Finance', 'Legal',
  'Design', 'Events', 'Education', 'Healthcare', 'Other',
];

const PRICE_TYPES = [
  { value: 'fixed',  label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'quote',  label: 'Custom Quote' },
];

const emptyForm = () => ({
  title:       '',
  category:    'Other',
  priceType:   'fixed',
  price:       '',
  shortDesc:   '',
  description: '',
  isActive:    true,
  isFeatured:  false,
});

export default function AdminServicesPage() {
  const locale = useLocale();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Service | null>(null);
  const [form,      setForm]      = useState(emptyForm());
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => get<Service[]>('/services/admin/all'),
    select:   (r) => r.data,
  });

  const services = (data as unknown as Service[]) ?? [];

  // ── Helpers ────────────────────────────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setImageUrls([]);
    setVideoUrls([]);
    setShowForm(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setForm({
      title:       s.title,
      category:    s.category,
      priceType:   s.priceType,
      price:       s.price?.toString() ?? '',
      shortDesc:   s.shortDesc ?? '',
      description: s.description,
      isActive:    s.isActive,
      isFeatured:  s.isFeatured,
    });
    setImageUrls(s.images  ?? []);
    setVideoUrls(s.videos  ?? []);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  // ── Mutations ──────────────────────────────────────────────────────────────
  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        price:  form.price ? Number(form.price) : undefined,
        images: imageUrls,
        videos: videoUrls,
      };
      return editing
        ? put(`/services/${editing.id}`, payload)
        : post('/services', payload);
    },
    onSuccess: () => {
      toast({ title: editing ? 'Service updated' : 'Service created' });
      qc.invalidateQueries({ queryKey: ['admin-services'] });
      closeForm();
    },
    onError: () => toast({ title: 'Failed to save service', variant: 'destructive' }),
  });

  const { mutate: deleteService } = useMutation({
    mutationFn: (id: string) => del(`/services/${id}`),
    onSuccess: () => { toast({ title: 'Service deleted' }); qc.invalidateQueries({ queryKey: ['admin-services'] }); },
    onError:   () => toast({ title: 'Delete failed', variant: 'destructive' }),
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      put(`/services/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  const { mutate: toggleFeatured } = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      put(`/services/${id}`, { isFeatured }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  const canSave = form.title.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-artic-teal" /> Services
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage services offered on the marketplace</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-artic-teal hover:bg-artic-teal/80 text-black rounded-lg gap-2"
        >
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      {/* ── Create / Edit Form ──────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              {editing ? `Edit: ${editing.title}` : 'New Service'}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="p-1 text-gray-400 hover:text-gray-700 rounded"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <Label>Title *</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Professional Photography Services"
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <select
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal bg-white"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                aria-label="Category"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Pricing Type */}
            <div>
              <Label>Pricing Type</Label>
              <select
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal bg-white"
                value={form.priceType}
                onChange={(e) => setForm({ ...form, priceType: e.target.value })}
                aria-label="Pricing type"
              >
                {PRICE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            {form.priceType !== 'quote' && (
              <div>
                <Label>Price ($) {form.priceType === 'hourly' ? '/ hr' : ''}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Short description */}
            <div className="sm:col-span-2">
              <Label>Short Description</Label>
              <Input
                className="mt-1"
                value={form.shortDesc}
                onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                placeholder="One-line summary shown in cards"
              />
            </div>

            {/* Full description */}
            <div className="sm:col-span-2">
              <Label>Full Description (Markdown)</Label>
              <textarea
                rows={6}
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none
                           focus:ring-2 focus:ring-artic-teal resize-y bg-white"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="## Service Overview&#10;&#10;Describe what you offer, your process, and what clients get..."
              />
            </div>

            {/* Toggles */}
            <div className="sm:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 accent-artic-teal"
                />
                Active (visible to customers)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="h-4 w-4 accent-artic-teal"
                />
                Featured (highlighted on homepage)
              </label>
            </div>
          </div>

          {/* Images upload */}
          <MediaUploadField
            label="Service Images"
            hint="Upload photos showcasing this service. JPG, PNG, WebP, GIF supported."
            value={imageUrls}
            onChange={setImageUrls}
            maxFiles={10}
            entityType="service"
            entityId={editing?.id}
          />

          {/* Videos upload */}
          <MediaUploadField
            label="Service Videos"
            hint="Upload demo or explainer videos. MP4, WebM, MOV supported. Max 200 MB each."
            value={videoUrls}
            onChange={setVideoUrls}
            maxFiles={5}
            entityType="service"
            entityId={editing?.id}
          />

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => save()}
              disabled={!canSave || isPending}
              className="bg-artic-teal hover:bg-artic-teal/80 text-black rounded-lg gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? 'Update Service' : 'Create Service'}
            </Button>
            <Button variant="outline" onClick={closeForm} className="rounded-lg">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Services Table ─────────────────────────────────────────────────── */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Service</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Media</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Featured</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="skeleton h-4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-14 text-gray-500">
                  <Wrench className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium">No services yet</p>
                  <p className="text-xs mt-1">Add your first service to get started</p>
                </td>
              </tr>
            ) : (
              services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  {/* Service name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-artic-teal/10 flex-shrink-0">
                        {s.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.images[0]}
                            alt={s.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-artic-teal" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{s.title}</p>
                        {s.shortDesc && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{s.shortDesc}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="text-xs bg-artic-teal/10 text-artic-teal px-2 py-0.5 rounded-full font-medium">
                      {s.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-sm">
                    {s.priceType === 'quote'  ? <span className="text-gray-400 italic">Quote</span>      :
                     s.priceType === 'hourly' ? <span>${s.price}/hr</span>                               :
                     s.price                  ? <span className="font-medium">${s.price}</span>           :
                     <span className="text-gray-400">—</span>}
                  </td>

                  {/* Media count */}
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {(s.images?.length ?? 0) > 0 && (
                      <span className="inline-block bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded mr-1">
                        {s.images.length} img
                      </span>
                    )}
                    {(s.videos?.length ?? 0) > 0 && (
                      <span className="inline-block bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                        {s.videos.length} vid
                      </span>
                    )}
                    {!s.images?.length && !s.videos?.length && '—'}
                  </td>

                  {/* Featured */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleFeatured({ id: s.id, isFeatured: !s.isFeatured })}
                      aria-label="Toggle featured"
                      className={`p-1 rounded transition-colors ${
                        s.isFeatured ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="h-4 w-4" fill={s.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                  </td>

                  {/* Active toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive({ id: s.id, isActive: !s.isActive })}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        s.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/${locale}/services/${s.slug}`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-artic-link rounded"
                        title="Preview in store"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 text-gray-400 hover:text-artic-teal hover:bg-orange-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${s.title}"?`)) deleteService(s.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
