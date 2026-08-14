'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, X, Upload } from 'lucide-react';
import { get, post, put } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  images: z.array(z.string()).min(1, 'At least one image required'),
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

export default function ProductForm({ initialData, productId }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'seo'>('basic');

  const { data: categoriesData } = useQuery({
    queryKey: ['all-categories'],
    queryFn: () => get<Array<{ id: string; name: string }>>('/categories'),
  });

  const { data: brandsData } = useQuery({
    queryKey: ['all-brands'],
    queryFn: () => get<Array<{ id: string; name: string }>>('/brands'),
  });

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

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

  const images = watch('images');
  const isPublished = watch('isPublished');
  const isFeatured = watch('isFeatured');

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      return productId
        ? put(`/products/${productId}`, payload)
        : post('/products', payload);
    },
    onSuccess: () => {
      toast({ title: productId ? 'Product updated' : 'Product created' });
      router.push(`/${locale}/admin/products`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save product';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });

  const TABS = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'media', label: 'Images & Media' },
    { id: 'seo', label: 'SEO & Publish' },
  ] as const;

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-0 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-artic-orange text-artic-orange' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="bg-white border rounded-lg p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Product Name *</Label>
              <Input className="mt-1" {...register('name')} placeholder="e.g., Samsung Galaxy S25 Ultra" />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label>Category *</Label>
              <select
                {...register('categoryId')}
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-orange"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-destructive text-sm mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <Label>Brand</Label>
              <select
                {...register('brandId')}
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-orange"
              >
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Sale Price *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <Input type="number" step="0.01" min="0" className="pl-7" {...register('price', { valueAsNumber: true })} />
              </div>
              {errors.price && <p className="text-destructive text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <Label>Original / List Price *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <Input type="number" step="0.01" min="0" className="pl-7" {...register('listPrice', { valueAsNumber: true })} />
              </div>
              {errors.listPrice && <p className="text-destructive text-sm mt-1">{errors.listPrice.message}</p>}
            </div>

            <div>
              <Label>Stock Quantity *</Label>
              <Input type="number" min="0" className="mt-1" {...register('countInStock', { valueAsNumber: true })} />
            </div>

            <div>
              <Label>SKU</Label>
              <Input className="mt-1" {...register('sku')} placeholder="Optional" />
            </div>

            <div className="sm:col-span-2">
              <Label>Short Description</Label>
              <Input className="mt-1" {...register('shortDesc')} placeholder="One-line summary" />
            </div>

            <div className="sm:col-span-2">
              <Label>Full Description (Markdown)</Label>
              <textarea
                {...register('description')}
                rows={6}
                placeholder="## Product Title&#10;&#10;Detailed product description..."
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-orange resize-y"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Tags (comma-separated)</Label>
              <Input className="mt-1" {...register('tags')} placeholder="e.g., new arrival, sale, featured" />
            </div>
          </div>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'media' && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div>
            <Label>Image URLs</Label>
            <p className="text-xs text-gray-500 mb-3">Add image URLs or upload files. First image is the main product image.</p>
            <div className="space-y-2">
              {images.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => {
                      const newImages = [...images];
                      newImages[i] = e.target.value;
                      setValue('images', newImages);
                    }}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {url && <img src={url} alt={`Product ${i+1}`} className="w-10 h-10 object-contain border rounded bg-gray-50" />}
                  <button
                    type="button"
                    onClick={() => setValue('images', images.filter((_, j) => j !== i))}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue('images', [...images, ''])}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add Image URL
              </Button>
            </div>
            {errors.images && <p className="text-destructive text-sm mt-1">{errors.images.message}</p>}
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="bg-white border rounded-lg p-6 space-y-5">
          <div>
            <Label>Meta Title</Label>
            <Input className="mt-1" {...register('metaTitle')} placeholder="Leave blank to use product name" />
            <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
          </div>

          <div>
            <Label>Meta Description</Label>
            <textarea
              {...register('metaDesc')}
              rows={3}
              placeholder="Brief description for search engines..."
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-orange resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setValue('isPublished', !isPublished)}
                className={`w-11 h-6 rounded-full transition-colors relative ${isPublished ? 'bg-artic-orange' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
              <div>
                <p className="font-medium text-sm">Published</p>
                <p className="text-xs text-gray-500">Visible to customers</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setValue('isFeatured', !isFeatured)}
                className={`w-11 h-6 rounded-full transition-colors relative ${isFeatured ? 'bg-artic-orange' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
              <div>
                <p className="font-medium text-sm">Featured</p>
                <p className="text-xs text-gray-500">Show on homepage featured section</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="bg-artic-orange hover:bg-artic-orange-dark text-black rounded-lg px-8">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {productId ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg">
          Cancel
        </Button>
      </div>
    </form>
  );
}
