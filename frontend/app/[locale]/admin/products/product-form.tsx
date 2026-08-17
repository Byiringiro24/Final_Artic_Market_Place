'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, X, Upload, ImagePlus, Video, GripVertical, Link2 } from 'lucide-react';
import { get, post, put } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/api/v1').replace('/api/v1', '');

function resolveUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  categoryId: z.string().min(1, 'Select a category'),
  brandId: z.string().optional(),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0.01),
  listPrice: z.number().min(0.01),
  countInStock: z.number().int().min(0),
  sku: z.string().optional(),
  images: z.array(z.string()),
  tags: z.string().optional(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initialData?: Partial<FormData & { id: string; tags: string[] }>;
  productId?: string;
}

type MediaItem = { url: string; type: 'image' | 'video' };

export default function ProductForm({ initialData, productId }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'variants' | 'seo'>('basic');
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    (initialData?.images || []).map((url) => ({
      url,
      type: url.includes('/videos/') || url.endsWith('.mp4') || url.endsWith('.webm') ? 'video' : 'image',
    }))
  );
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['all-categories'],
    queryFn: () => get<Array<{ id: string; name: string }>>('/categories'),
  });
  const { data: brandsData } = useQuery({
    queryKey: ['all-brands'],
    queryFn: () => get<Array<{ id: string; name: string }>>('/brands'),
  });

  const categories = (categoriesData?.data as unknown as Array<{ id: string; name: string }>) || [];
  const brands = (brandsData?.data as unknown as Array<{ id: string; name: string }>) || [];

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      categoryId: initialData?.categoryId || '',
      brandId: initialData?.brandId || '',
      shortDesc: initialData?.shortDesc || '',
      description: initialData?.description || '',
      price: Number(initialData?.price) || 0,
      listPrice: Number(initialData?.listPrice) || 0,
      countInStock: Number(initialData?.countInStock) || 0,
      sku: initialData?.sku || '',
      images: initialData?.images || [],
      tags: Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : '',
      isPublished: initialData?.isPublished ?? false,
      isFeatured: initialData?.isFeatured ?? false,
      metaTitle: initialData?.metaTitle || '',
      metaDesc: initialData?.metaDesc || '',
    },
  });

  const isPublished = watch('isPublished');
  const isFeatured = watch('isFeatured');

  // Sync mediaItems → form images field
  function syncImages(items: MediaItem[]) {
    setMediaItems(items);
    setValue('images', items.map((i) => i.url));
  }

  // Upload files to backend
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/media`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      const newItems: MediaItem[] = (data.data?.files || []).map((f: { url: string; type: string }) => ({
        url: f.url,
        type: f.type as 'image' | 'video',
      }));

      syncImages([...mediaItems, ...newItems]);
      toast({ title: `${newItems.length} file${newItems.length > 1 ? 's' : ''} uploaded successfully` });
    } catch (err) {
      toast({ title: 'Upload failed', description: 'Please check your connection and try again', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Add URL manually
  function addUrlItem() {
    const url = urlInput.trim();
    if (!url) return;
    const type: 'image' | 'video' =
      url.includes('/videos/') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')
        ? 'video'
        : 'image';
    syncImages([...mediaItems, { url, type }]);
    setUrlInput('');
  }

  function removeMedia(index: number) {
    syncImages(mediaItems.filter((_, i) => i !== index));
  }

  function moveMedia(from: number, to: number) {
    const updated = [...mediaItems];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    syncImages(updated);
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        images: mediaItems.map((m) => m.url),
      };
      return productId
        ? put(`/products/${productId}`, payload)
        : post('/products', payload);
    },
    onSuccess: () => {
      toast({ title: productId ? 'Product updated!' : 'Product created!' });
      router.push(`/${locale}/admin/products`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save product';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });

  const TABS = [
    { id: 'basic', label: '📝 Basic Info' },
    { id: 'media', label: `🖼 Media (${mediaItems.length})` },
    { id: 'variants', label: '🎨 Variants' },
    { id: 'seo', label: '🔍 SEO & Publish' },
  ] as const;

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-5">
      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-artic-teal text-artic-teal'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Basic Info ──────────────────────────────────────────────── */}
      {activeTab === 'basic' && (
        <div className="bg-white border rounded-lg p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Product Name *</Label>
              <Input className="mt-1" {...register('name')} placeholder="e.g., Samsung Galaxy S25 Ultra" autoFocus />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label>Category *</Label>
              <select {...register('categoryId')} className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal">
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-destructive text-sm mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <Label>Brand</Label>
              <select {...register('brandId')} className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal">
                <option value="">No brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <Label>Sale Price ($) *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <Input type="number" step="0.01" min="0" className="pl-7" {...register('price', { valueAsNumber: true })} />
              </div>
              {errors.price && <p className="text-destructive text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <Label>Original Price ($)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <Input type="number" step="0.01" min="0" className="pl-7" {...register('listPrice', { valueAsNumber: true })} />
              </div>
            </div>

            <div>
              <Label>Stock Quantity *</Label>
              <Input type="number" min="0" className="mt-1" {...register('countInStock', { valueAsNumber: true })} />
            </div>

            <div>
              <Label>SKU (optional)</Label>
              <Input className="mt-1" {...register('sku')} placeholder="e.g., SKU-001" />
            </div>

            <div className="sm:col-span-2">
              <Label>Short Description</Label>
              <Input className="mt-1" {...register('shortDesc')} placeholder="One-line product summary" />
            </div>

            <div className="sm:col-span-2">
              <Label>Full Description (Markdown supported)</Label>
              <textarea
                {...register('description')}
                rows={7}
                placeholder="## Product Features&#10;&#10;- Feature 1&#10;- Feature 2"
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal resize-y font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Tags (comma-separated)</Label>
              <Input className="mt-1" {...register('tags')} placeholder="e.g., new arrival, sale, electronics" />
            </div>
          </div>
        </div>
      )}

      {/* ─── Media ───────────────────────────────────────────────────── */}
      {activeTab === 'media' && (
        <div className="bg-white border rounded-lg p-6 space-y-5">
          <div>
            <h3 className="font-semibold mb-1">Product Images & Videos</h3>
            <p className="text-xs text-gray-500 mb-4">
              Drag to reorder. First image is the main product image. Supports JPEG, PNG, WebP, GIF, MP4, WebM.
            </p>

            {/* Upload buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload Files'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm,video/ogg"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Add by URL */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrlItem())}
                  placeholder="Or paste an image/video URL and press Enter"
                  className="pl-9"
                />
              </div>
              <Button type="button" variant="outline" onClick={addUrlItem} disabled={!urlInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Media grid */}
            {mediaItems.length === 0 ? (
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center cursor-pointer hover:border-artic-teal transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Click to upload images or videos</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF, MP4, WebM · Max 100MB per video, 10MB per image</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {mediaItems.map((item, i) => (
                  <div
                    key={i}
                    className={`relative group border rounded-lg overflow-hidden bg-gray-50 aspect-square ${
                      i === 0 ? 'ring-2 ring-artic-teal' : ''
                    }`}
                  >
                    {/* Main badge */}
                    {i === 0 && (
                      <span className="absolute top-1 left-1 z-10 bg-artic-teal text-black text-[10px] font-bold px-1.5 rounded">
                        MAIN
                      </span>
                    )}

                    {/* Media preview */}
                    {item.type === 'video' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gray-900">
                        <Video className="h-8 w-8 text-white" />
                        <p className="text-white text-xs">Video</p>
                        <video
                          src={resolveUrl(item.url)}
                          className="absolute inset-0 w-full h-full object-cover opacity-30"
                          muted
                        />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveUrl(item.url)}
                        alt={`Media ${i + 1}`}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                      />
                    )}

                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => moveMedia(i, i - 1)}
                          className="p-1 bg-white/90 rounded text-xs text-gray-700 hover:bg-white"
                          title="Move left"
                        >
                          ←
                        </button>
                      )}
                      {i < mediaItems.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveMedia(i, i + 1)}
                          className="p-1 bg-white/90 rounded text-xs text-gray-700 hover:bg-white"
                          title="Move right"
                        >
                          →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Index badge */}
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                      {i + 1}
                    </span>
                  </div>
                ))}

                {/* Add more button */}
                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-artic-teal hover:bg-orange-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Add more</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Variants ────────────────────────────────────────────────── */}
      {activeTab === 'variants' && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">Product Variants</h3>
          <p className="text-sm text-gray-500">
            Add color, size, or other variants after creating the product. Variants can be managed from the product detail page.
          </p>
          <div className="bg-artic-light-bg rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium mb-2">Variant examples:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Colors: Red, Blue, Black, White</li>
              <li>Sizes: XS, S, M, L, XL, XXL</li>
              <li>Storage: 128GB, 256GB, 512GB</li>
              <li>Material: Cotton, Polyester, Wool</li>
            </ul>
          </div>
        </div>
      )}

      {/* ─── SEO & Publish ───────────────────────────────────────────── */}
      {activeTab === 'seo' && (
        <div className="bg-white border rounded-lg p-6 space-y-5">
          <div>
            <Label>Meta Title</Label>
            <Input className="mt-1" {...register('metaTitle')} placeholder="Leave blank to auto-use product name" />
            <p className="text-xs text-gray-400 mt-1">Recommended: 50–60 characters</p>
          </div>

          <div>
            <Label>Meta Description</Label>
            <textarea
              {...register('metaDesc')}
              rows={3}
              placeholder="Brief description for search engines..."
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Recommended: 150–160 characters</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Published toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Published</p>
                <p className="text-xs text-gray-500">Visible to customers on the store</p>
              </div>
              <div
                role="switch"
                aria-checked={isPublished}
                onClick={() => setValue('isPublished', !isPublished)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isPublished ? 'bg-artic-teal' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  isPublished ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </div>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Featured Product</p>
                <p className="text-xs text-gray-500">Shows on homepage featured section</p>
              </div>
              <div
                role="switch"
                aria-checked={isFeatured}
                onClick={() => setValue('isFeatured', !isFeatured)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isFeatured ? 'bg-artic-teal' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  isFeatured ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons — always visible */}
      <div className="flex gap-3 sticky bottom-0 bg-artic-light-bg py-4 border-t">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-lg px-8 font-semibold"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {productId ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg">
          Cancel
        </Button>
        {productId && (
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(`/${locale}/product/${productId}`, '_blank')}
            className="rounded-lg ml-auto"
          >
            View in Store ↗
          </Button>
        )}
      </div>
    </form>
  );
}
