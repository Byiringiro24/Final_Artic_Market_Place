'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Eye, EyeOff, Edit2, X, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { get, del, post, put } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MediaUploadField from '@/components/shared/MediaUploadField';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm = () => ({
  title: '',
  subtitle: '',
  imageUrl: '',        // single final URL sent to API
  linkUrl: '',
  buttonText: 'Shop Now',
  isActive: true,
  sortOrder: 0,
});

export default function AdminBannersPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm());

  // mediaUrls drives the MediaUploadField; we sync to form.imageUrl on change
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => get<Banner[]>('/banners/all'),
    select: (r) => r.data,
  });

  const banners = (data as unknown as Banner[]) ?? [];

  // ── helpers ──────────────────────────────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setMediaUrls([]);
    setShowForm(true);
  }

  function openEdit(b: Banner) {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? '',
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl ?? '',
      buttonText: b.buttonText ?? 'Shop Now',
      isActive: b.isActive,
      sortOrder: b.sortOrder,
    });
    setMediaUrls(b.imageUrl ? [b.imageUrl] : []);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  // Keep imageUrl in sync with the media field (use first URL only for banner)
  function handleMediaChange(urls: string[]) {
    setMediaUrls(urls);
    setForm((f) => ({ ...f, imageUrl: urls[0] ?? '' }));
  }

  // ── mutations ─────────────────────────────────────────────────────────────────
  const { mutate: saveBanner, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        title:      form.title.trim(),
        subtitle:   form.subtitle.trim() || undefined,
        imageUrl:   form.imageUrl.trim(),
        linkUrl:    form.linkUrl.trim()  || undefined,
        buttonText: form.buttonText.trim() || undefined,
        isActive:   form.isActive,
        sortOrder:  Number(form.sortOrder),
      };
      return editing ? put(`/banners/${editing.id}`, payload) : post('/banners', payload);
    },
    onSuccess: () => {
      toast({ title: editing ? 'Banner updated' : 'Banner created' });
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      closeForm();
    },
    onError: () => toast({ title: 'Failed to save banner', variant: 'destructive' }),
  });

  const { mutate: deleteBanner } = useMutation({
    mutationFn: (id: string) => del(`/banners/${id}`),
    onSuccess: () => { toast({ title: 'Banner deleted' }); qc.invalidateQueries({ queryKey: ['admin-banners'] }); },
    onError: () => toast({ title: 'Delete failed', variant: 'destructive' }),
  });

  const { mutate: toggleBanner } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => put(`/banners/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  const canSave = form.title.trim().length > 0 && form.imageUrl.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-artic-teal" /> Homepage Banners
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage hero &amp; promotional banners</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-artic-teal hover:bg-artic-teal/80 text-black rounded-lg gap-2"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      {/* ── Create / Edit Form ─────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              {editing ? `Edit: ${editing.title}` : 'New Banner'}
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
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Summer Sale — Up to 50% Off"
              />
            </div>

            {/* Subtitle */}
            <div>
              <Label>Subtitle</Label>
              <Input
                className="mt-1"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Optional tagline"
              />
            </div>

            {/* Link URL */}
            <div>
              <Label>Link URL</Label>
              <Input
                className="mt-1"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="/search?category=fashion"
              />
            </div>

            {/* Button Text */}
            <div>
              <Label>Button Text</Label>
              <Input
                className="mt-1"
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                placeholder="Shop Now"
              />
            </div>

            {/* Sort Order */}
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                min={0}
                className="mt-1"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
              <p className="text-xs text-gray-400 mt-1">Lower number = shown first</p>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                id="banner-active"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 accent-artic-teal"
              />
              <label htmlFor="banner-active" className="text-sm cursor-pointer">
                Active (visible on homepage)
              </label>
            </div>
          </div>

          {/* Media upload — single image for banner */}
          <MediaUploadField
            label="Banner Image *"
            hint="Recommended size: 1920 × 600 px. Supports JPG, PNG, WebP."
            value={mediaUrls}
            onChange={handleMediaChange}
            maxFiles={1}
            multiple={false}
            entityType="banner"
            entityId={editing?.id}
          />

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => saveBanner()}
              disabled={!canSave || isPending}
              className="bg-artic-teal hover:bg-artic-teal/80 text-black rounded-lg gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? 'Update Banner' : 'Create Banner'}
            </Button>
            <Button variant="outline" onClick={closeForm} className="rounded-lg">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Banner Cards ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-xl" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-xl text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No banners yet</p>
          <p className="text-sm mt-1">Add your first banner to show on the homepage</p>
          <Button onClick={openCreate} className="mt-4 bg-artic-teal text-black rounded-lg gap-2">
            <Plus className="h-4 w-4" /> Add First Banner
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-opacity ${!banner.isActive ? 'opacity-50' : ''}`}
            >
              {/* Image preview */}
              <div className="relative h-36 bg-gray-100">
                {banner.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <div className="text-white">
                    <p className="font-bold text-sm leading-tight">{banner.title}</p>
                    {banner.subtitle && (
                      <p className="text-xs opacity-80 mt-0.5">{banner.subtitle}</p>
                    )}
                  </div>
                </div>
                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {banner.isActive ? 'Live' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>Order: <span className="font-medium text-gray-600">{banner.sortOrder}</span></p>
                  {banner.linkUrl && (
                    <p className="truncate max-w-[140px]" title={banner.linkUrl}>
                      → {banner.linkUrl}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleBanner({ id: banner.id, isActive: !banner.isActive })}
                    className={`p-1.5 rounded transition-colors ${
                      banner.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    aria-label={banner.isActive ? 'Hide banner' : 'Show banner'}
                    title={banner.isActive ? 'Hide' : 'Show'}
                  >
                    {banner.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-1.5 text-gray-400 hover:text-artic-teal hover:bg-orange-50 rounded"
                    aria-label="Edit banner"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete banner "${banner.title}"?`)) deleteBanner(banner.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    aria-label="Delete banner"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
