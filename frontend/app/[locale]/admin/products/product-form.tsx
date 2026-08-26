'use client';

/**
 * ProductForm — Create / Edit product
 *
 * Media tab supports ALL three methods simultaneously:
 *   1. Drag-and-drop files onto the drop zone
 *   2. Click "Upload Files" button → file picker
 *   3. Paste any URL and press Add / Enter
 *
 * Supports: images (JPEG, PNG, WebP, GIF, AVIF),
 *           videos (MP4, WebM, MOV, OGG, AVI),
 *           audio  (MP3, WAV, OGG, AAC, FLAC)
 */

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2, Plus, X, Upload, ImagePlus, Video, Music,
  Link2, GripVertical, AlertCircle,
} from 'lucide-react';
import { api, get, post, put } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/api/v1').replace('/api/v1', '');

const ACCEPT_ALL = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
  'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/aac', 'audio/flac',
].join(',');

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;
const AUDIO_EXT = /\.(mp3|ogg|wav|aac|flac|m4a)(\?.*)?$/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveUrl(url: string): string {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http') || url.startsWith('/uploads')) return url.startsWith('/') ? `${API_BASE}${url}` : url;
  return url;
}

type MediaType = 'image' | 'video' | 'audio';

function detectType(url: string): MediaType {
  if (VIDEO_EXT.test(url) || url.includes('/videos/')) return 'video';
  if (AUDIO_EXT.test(url) || url.includes('/audio/'))  return 'audio';
  return 'image';
}

interface MediaItem { url: string; type: MediaType }

// ─── Zod schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  name:          z.string().min(3, 'Name must be at least 3 characters'),
  categoryId:    z.string().min(1, 'Select a category'),
  brandId:       z.string().optional(),
  shortDesc:     z.string().optional(),
  description:   z.string().optional(),
  price:         z.number().min(0.01, 'Price must be greater than 0'),
  listPrice:     z.number().min(0),
  countInStock:  z.number().int().min(0),
  sku:           z.string().optional(),
  images:        z.array(z.string()),
  tags:          z.string().optional(),
  isPublished:   z.boolean(),
  isFeatured:    z.boolean(),
  metaTitle:     z.string().optional(),
  metaDesc:      z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initialData?: Partial<FormData & { id: string; tags: string[]; videos?: string[] }>;
  productId?: string;
}

// ─── Thumbnail card ───────────────────────────────────────────────────────────

function MediaCard({
  item, index, total, onRemove, onMoveLeft, onMoveRight,
}: {
  item: MediaItem; index: number; total: number;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  return (
    <div className={cn(
      'relative group border rounded-xl overflow-hidden bg-gray-50 aspect-square select-none',
      index === 0 && 'ring-2 ring-artic-teal',
    )}>
      {index === 0 && (
        <span className="absolute top-1.5 left-1.5 z-10 bg-artic-teal text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
          MAIN
        </span>
      )}

      {/* Preview */}
      {item.type === 'video' ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gray-900">
          <Video className="h-8 w-8 text-white/80" />
          <span className="text-white/60 text-[10px] px-2 text-center truncate w-full">
            {item.url.split('/').pop()?.slice(0, 20)}
          </span>
          <video
            src={resolveUrl(item.url)}
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
            muted
            preload="metadata"
          />
        </div>
      ) : item.type === 'audio' ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-indigo-50">
          <Music className="h-8 w-8 text-indigo-400" />
          <span className="text-indigo-400 text-[10px] px-2 text-center truncate w-full">
            {item.url.split('/').pop()?.slice(0, 20)}
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveUrl(item.url)}
          alt={`Media ${index + 1}`}
          className="w-full h-full object-contain p-1.5"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
        />
      )}

      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all
                      flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
        {index > 0 && (
          <button type="button" onClick={onMoveLeft}
            className="p-1.5 bg-white/90 text-gray-800 rounded-lg hover:bg-white text-xs font-bold shadow"
            title="Move left / set as main">
            ←
          </button>
        )}
        <button type="button" onClick={onRemove}
          className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow"
          title="Remove">
          <X className="h-3.5 w-3.5" />
        </button>
        {index < total - 1 && (
          <button type="button" onClick={onMoveRight}
            className="p-1.5 bg-white/90 text-gray-800 rounded-lg hover:bg-white text-xs font-bold shadow"
            title="Move right">
            →
          </button>
        )}
      </div>

      {/* Position badge */}
      <span className="absolute bottom-1 right-1.5 bg-black/60 text-white text-[9px] px-1 rounded">
        {index + 1}
      </span>

      {/* Type badge */}
      {item.type !== 'image' && (
        <span className={cn(
          'absolute bottom-1 left-1.5 text-[9px] px-1.5 py-0.5 rounded font-medium',
          item.type === 'video' ? 'bg-purple-500 text-white' : 'bg-indigo-500 text-white',
        )}>
          {item.type.toUpperCase()}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductForm({ initialData, productId }: Props) {
  const router  = useRouter();
  const locale  = useLocale();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'variants' | 'seo'>('basic');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver]   = useState(false);
  const [urlInput, setUrlInput]   = useState('');

  // Merge images + videos from initialData into one unified mediaItems array
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const imgs = (initialData?.images || []).map((url) => ({
      url, type: detectType(url),
    }));
    const vids = (initialData?.videos || [])
      .filter((url) => !imgs.find((i) => i.url === url))
      .map((url) => ({ url, type: 'video' as MediaType }));
    return [...imgs, ...vids];
  });

  // ── Data fetches ─────────────────────────────────────────────────────────────
  const { data: categoriesData } = useQuery({
    queryKey: ['all-categories'],
    queryFn: () => get<Array<{ id: string; name: string; parentId: string | null }>>('/categories'),
  });
  const { data: brandsData } = useQuery({
    queryKey: ['all-brands'],
    queryFn: () => get<Array<{ id: string; name: string }>>('/brands'),
  });

  const allCats = (categoriesData?.data as unknown as Array<{ id: string; name: string; parentId: string | null }>) || [];
  // Build hierarchical list: top-level first, then their children, grandchildren
  function buildCategoryOptions(cats: Array<{ id: string; name: string; parentId: string | null }>) {
    const options: Array<{ id: string; label: string }> = [];
    function addLevel(parentId: string | null, depth: number) {
      cats.filter((c) => c.parentId === parentId).forEach((c) => {
        options.push({ id: c.id, label: `${'  '.repeat(depth)}${depth > 0 ? '↳ ' : ''}${c.name}` });
        addLevel(c.id, depth + 1);
      });
    }
    addLevel(null, 0);
    return options;
  }
  const categories = buildCategoryOptions(allCats);
  const brands     = (brandsData?.data as unknown as Array<{ id: string; name: string }>) || [];

  // ── React Hook Form ───────────────────────────────────────────────────────────
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:         initialData?.name         || '',
      categoryId:   initialData?.categoryId   || '',
      brandId:      initialData?.brandId      || '',
      shortDesc:    initialData?.shortDesc    || '',
      description:  initialData?.description  || '',
      price:        Number(initialData?.price)        || 0,
      listPrice:    Number(initialData?.listPrice)    || 0,
      countInStock: Number(initialData?.countInStock) || 0,
      sku:          initialData?.sku          || '',
      images:       initialData?.images       || [],
      tags:         Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : (initialData?.tags as string) || '',
      isPublished:  initialData?.isPublished  ?? false,
      isFeatured:   initialData?.isFeatured   ?? false,
      metaTitle:    initialData?.metaTitle    || '',
      metaDesc:     initialData?.metaDesc     || '',
    },
  });

  const isPublished = watch('isPublished');
  const isFeatured  = watch('isFeatured');

  // ── Sync mediaItems → form.images (backend expects images array, we put all URLs there) ───
  function syncMedia(items: MediaItem[]) {
    setMediaItems(items);
    setValue('images', items.map((i) => i.url));
  }

  // ── Upload files (method 1 & 3: button + drag-drop) ─────────────────────────
  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      if (productId) formData.append('entityId', productId);
      formData.append('entityType', 'product');

      const { data } = await api.post<{
        success: boolean;
        data: { files: Array<{ url: string; type: string }> };
      }>('/upload/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      const newItems: MediaItem[] = (data.data?.files ?? []).map((f) => ({
        url:  f.url,
        type: f.type as MediaType,
      }));

      syncMedia([...mediaItems, ...newItems]);
      toast({ title: `${newItems.length} file${newItems.length !== 1 ? 's' : ''} uploaded` });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaItems, productId, toast]);

  // ── Method 2: paste URL ──────────────────────────────────────────────────────
  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (mediaItems.find((m) => m.url === url)) {
      toast({ title: 'URL already added', variant: 'destructive' });
      return;
    }
    syncMedia([...mediaItems, { url, type: detectType(url) }]);
    setUrlInput('');
  }

  // ── Reorder / remove ─────────────────────────────────────────────────────────
  function moveMedia(from: number, to: number) {
    const updated = [...mediaItems];
    const [item]  = updated.splice(from, 1);
    updated.splice(to, 0, item);
    syncMedia(updated);
  }
  function removeMedia(index: number) { syncMedia(mediaItems.filter((_, i) => i !== index)); }

  // ── Drag-and-drop ─────────────────────────────────────────────────────────────
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) uploadFiles(files);
  }

  // ── Form submit ───────────────────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      const images = mediaItems.filter((m) => m.type === 'image').map((m) => m.url);
      const videos = mediaItems.filter((m) => m.type === 'video').map((m) => m.url);
      const payload = {
        ...data,
        images,
        videos,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
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

  // ─── Tab definitions ──────────────────────────────────────────────────────────
  const TABS = [
    { id: 'basic',    label: '📝 Basic Info' },
    { id: 'media',    label: `🖼 Media (${mediaItems.length})` },
    { id: 'variants', label: '🎨 Variants' },
    { id: 'seo',      label: '🔍 SEO & Publish' },
  ] as const;

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-5">

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div className="flex border-b overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-artic-teal text-artic-teal'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════ BASIC INFO ══════════════════════════════════ */}
      {activeTab === 'basic' && (
        <div className="bg-white border rounded-xl p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <Label>Product Name *</Label>
              <Input className="mt-1" {...register('name')} placeholder="e.g. Samsung Galaxy S25 Ultra" autoFocus />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Category */}
            <div>
              <Label>Category *</Label>
              <select
                {...register('categoryId')}
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal bg-white"
                aria-label="Category"
              >
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-destructive text-xs mt-1">{errors.categoryId.message}</p>}
            </div>

            {/* Brand */}
            <div>
              <Label>Brand</Label>
              <select
                {...register('brandId')}
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal bg-white"
                aria-label="Brand"
              >
                <option value="">No brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* Sale price */}
            <div>
              <Label>Sale Price ($) *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <Input
                  type="number" step="0.01" min="0" className="pl-7"
                  {...register('price', { valueAsNumber: true })}
                />
              </div>
              {errors.price && <p className="text-destructive text-xs mt-1">{errors.price.message}</p>}
            </div>

            {/* Original price */}
            <div>
              <Label>Original / List Price ($)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <Input
                  type="number" step="0.01" min="0" className="pl-7"
                  {...register('listPrice', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <Label>Stock Quantity *</Label>
              <Input
                type="number" min="0" className="mt-1"
                {...register('countInStock', { valueAsNumber: true })}
              />
            </div>

            {/* SKU */}
            <div>
              <Label>SKU (optional)</Label>
              <Input className="mt-1" {...register('sku')} placeholder="e.g. SKU-001" />
            </div>

            {/* Short desc */}
            <div className="sm:col-span-2">
              <Label>Short Description</Label>
              <Input className="mt-1" {...register('shortDesc')} placeholder="One-line product summary" />
            </div>

            {/* Full desc */}
            <div className="sm:col-span-2">
              <Label>Full Description (Markdown supported)</Label>
              <textarea
                {...register('description')}
                rows={7}
                placeholder="## Product Features&#10;&#10;- Feature 1&#10;- Feature 2"
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal resize-y font-mono"
              />
            </div>

            {/* Tags */}
            <div className="sm:col-span-2">
              <Label>Tags (comma-separated)</Label>
              <Input className="mt-1" {...register('tags')} placeholder="new arrival, sale, electronics" />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ MEDIA ═══════════════════════════════════════ */}
      {activeTab === 'media' && (
        <div className="bg-white border rounded-xl p-6 space-y-5">
          <div>
            <h3 className="font-semibold">Product Media</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Use any combination of the three methods below. First item = main product image.
              Drag cards to reorder.
            </p>
          </div>

          {/* ── Method 1 & 3: Upload area (click + drag-and-drop) ── */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            aria-label="Upload area — click or drag files here"
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
              dragOver
                ? 'border-artic-teal bg-artic-teal/5 scale-[1.01]'
                : 'border-gray-200 hover:border-artic-teal hover:bg-gray-50',
              uploading && 'opacity-60 cursor-not-allowed pointer-events-none',
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-9 w-9 text-artic-teal animate-spin" />
                <p className="text-sm font-medium text-gray-600">Uploading… {uploadProgress}%</p>
                <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                  <div
                    className="h-full bg-artic-teal rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="flex gap-3 mb-1">
                  <ImagePlus className="h-7 w-7" />
                  <Video      className="h-7 w-7" />
                  <Music      className="h-7 w-7" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  <span className="text-artic-teal font-semibold">Click</span> to browse
                  &nbsp;·&nbsp;
                  <span className="text-artic-teal font-semibold">Drag &amp; drop</span> files here
                </p>
                <p className="text-xs">
                  Images (JPG, PNG, GIF, WebP, AVIF) &nbsp;·&nbsp;
                  Videos (MP4, WebM, MOV) &nbsp;·&nbsp;
                  Audio (MP3, WAV, AAC, FLAC)
                </p>
                <p className="text-xs text-gray-300">
                  Up to 15 files &nbsp;·&nbsp; Images: max {process.env.NEXT_PUBLIC_MAX_IMAGE_MB || 10} MB
                  &nbsp;·&nbsp; Videos: max 200 MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPT_ALL}
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(Array.from(e.target.files))}
            aria-label="File picker"
          />

          {/* ── Method 2: Paste URL ── */}
          <div className="space-y-1">
            <Label>Or paste a URL</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                  placeholder="https://example.com/product-image.jpg  (or video/audio URL)"
                  className="pl-9"
                  aria-label="Media URL input"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addUrl}
                disabled={!urlInput.trim()}
                className="gap-1 shrink-0"
              >
                <Plus className="h-4 w-4" /> Add URL
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Supports image URLs, video URLs (MP4/WebM/MOV), and audio URLs (MP3/WAV/AAC).
              Press <kbd className="bg-gray-100 px-1 rounded text-gray-500">Enter</kbd> to add.
            </p>
          </div>

          {/* ── Media grid ── */}
          {mediaItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl">
              <ImagePlus className="h-10 w-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No media added yet</p>
              <p className="text-xs mt-1">Use any of the methods above to add images, videos, or audio</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  {mediaItems.length} item{mediaItems.length !== 1 ? 's' : ''}&nbsp;
                  <span className="text-gray-400 font-normal">
                    · {mediaItems.filter((m) => m.type === 'image').length} images,{' '}
                    {mediaItems.filter((m) => m.type === 'video').length} videos,{' '}
                    {mediaItems.filter((m) => m.type === 'audio').length} audio
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => { if (confirm('Remove all media?')) syncMedia([]); }}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {mediaItems.map((item, i) => (
                  <MediaCard
                    key={`${item.url}-${i}`}
                    item={item}
                    index={i}
                    total={mediaItems.length}
                    onRemove={() => removeMedia(i)}
                    onMoveLeft={() => moveMedia(i, i - 1)}
                    onMoveRight={() => moveMedia(i, i + 1)}
                  />
                ))}

                {/* Add more tile */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Add more files"
                  className="border-2 border-dashed border-gray-200 rounded-xl aspect-square
                             flex flex-col items-center justify-center gap-1.5 cursor-pointer
                             hover:border-artic-teal hover:bg-orange-50 transition-colors select-none"
                >
                  <Plus className="h-6 w-6 text-gray-300" />
                  <span className="text-xs text-gray-400">Add more</span>
                </div>
              </div>

              {/* Hint */}
              <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  Hover over a card and use <strong>← →</strong> arrows to reorder.
                  The first item (marked <strong>MAIN</strong>) is the cover image.
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════ VARIANTS ════════════════════════════════════ */}
      {activeTab === 'variants' && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Product Variants</h3>
          <p className="text-sm text-gray-500">
            Add color, size, or other variants after creating the product.
            Variants can be managed from the product detail page.
          </p>
          <div className="bg-orange-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-medium mb-2">Examples of variants:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Colors: Red, Blue, Black, White</li>
              <li>Sizes: XS, S, M, L, XL, XXL</li>
              <li>Storage: 128 GB, 256 GB, 512 GB</li>
              <li>Material: Cotton, Polyester, Wool</li>
            </ul>
          </div>
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
            <GripVertical className="h-4 w-4 shrink-0" />
            Variant management panel available on the product edit page after initial creation.
          </div>
        </div>
      )}

      {/* ═══════════════════════ SEO & PUBLISH ═══════════════════════════════ */}
      {activeTab === 'seo' && (
        <div className="bg-white border rounded-xl p-6 space-y-5">
          <div>
            <Label>Meta Title</Label>
            <Input
              className="mt-1" {...register('metaTitle')}
              placeholder="Leave blank to auto-use product name"
            />
            <p className="text-xs text-gray-400 mt-1">Recommended: 50–60 characters</p>
          </div>

          <div>
            <Label>Meta Description</Label>
            <textarea
              {...register('metaDesc')}
              rows={3}
              placeholder="Brief description for search engines (150–160 characters)…"
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-artic-teal resize-none"
            />
          </div>

          <div className="space-y-3 pt-1">
            {/* Published */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-sm">Published</p>
                <p className="text-xs text-gray-400">Visible to customers on the store</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isPublished}
                onClick={() => setValue('isPublished', !isPublished)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  isPublished ? 'bg-artic-teal' : 'bg-gray-300',
                )}
              >
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                  isPublished ? 'translate-x-7' : 'translate-x-1',
                )} />
              </button>
            </div>

            {/* Featured */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-sm">Featured Product</p>
                <p className="text-xs text-gray-400">Shows in the homepage featured section</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isFeatured}
                onClick={() => setValue('isFeatured', !isFeatured)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  isFeatured ? 'bg-artic-teal' : 'bg-gray-300',
                )}
              >
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                  isFeatured ? 'translate-x-7' : 'translate-x-1',
                )} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky action bar ─────────────────────────────────────────────────── */}
      <div className="flex gap-3 sticky bottom-0 bg-gray-100 py-4 border-t z-10">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-artic-teal hover:bg-artic-teal/80 text-black rounded-xl px-8 font-semibold gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {productId ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">
          Cancel
        </Button>
        {productId && (
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(`/${locale}/product/${productId}`, '_blank')}
            className="rounded-xl ml-auto"
          >
            View in Store ↗
          </Button>
        )}
      </div>
    </form>
  );
}
