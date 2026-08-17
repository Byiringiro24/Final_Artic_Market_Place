'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { get, del, put } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
  id: string; name: string; slug: string; price: number; countInStock: number;
  isPublished: boolean; isFeatured: boolean; numSales: number; createdAt: string;
  images: string[]; category: { name: string }; brand?: { name: string } | null;
}
interface ApiData {
  data: Product[];
  pagination: { total: number; totalPages: number; page: number };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/api/v1';

function resolveImageUrl(url: string): string {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http')) return url;
  // Relative path — serve from backend
  return `${API_URL.replace('/api/v1', '')}${url}`;
}

export default function AdminProductsPage() {
  const locale = useLocale();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, statusFilter],
    queryFn: () =>
      get<ApiData['data']>(
        `/products/admin/all?limit=20&page=${page}${search ? `&search=${search}` : ''}${statusFilter !== '' ? `&isPublished=${statusFilter}` : ''}`
      ),
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id: string) => del(`/products/${id}`),
    onSuccess: () => {
      toast({ title: 'Product deleted' });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast({ title: 'Delete failed', variant: 'destructive' }),
  });

  const { mutate: togglePublish } = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      put(`/products/${id}`, { isPublished }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const products = (data?.data as unknown as Product[]) || [];
  const pagination = (data as unknown as ApiData)?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild className="bg-artic-orange hover:bg-artic-orange-dark text-black rounded-lg gap-2">
          <Link href={`/${locale}/admin/products/create`}>
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-artic-orange focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Drafts</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Sales</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No products found.{' '}
                    <Link href={`/${locale}/admin/products/create`} className="text-artic-link hover:underline">
                      Add your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 border rounded flex-shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveImageUrl(product.images?.[0] || '')}
                            alt={product.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[180px]">{product.name}</p>
                          <p className="text-xs text-gray-400">{formatDate(product.createdAt)}</p>
                          {product.brand && (
                            <p className="text-xs text-gray-400">{product.brand.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category?.name}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={
                        product.countInStock === 0 ? 'text-red-600 font-semibold' :
                        product.countInStock <= 5 ? 'text-orange-600 font-semibold' : ''
                      }>
                        {product.countInStock}
                        {product.countInStock === 0 && ' ⚠'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{product.numSales}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePublish({ id: product.id, isPublished: !product.isPublished })}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          product.isPublished
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {product.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {product.isPublished ? 'Live' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/${locale}/product/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-artic-link rounded"
                          title="View in store"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/${locale}/admin/products/${product.id}`}
                          className="p-1.5 text-gray-400 hover:text-artic-orange hover:bg-orange-50 rounded"
                          title="Edit product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                          title="Delete product"
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <span className="text-gray-500">
              {pagination.total} product{pagination.total !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-1 items-center">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <span className="px-3 text-sm">{page} / {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
