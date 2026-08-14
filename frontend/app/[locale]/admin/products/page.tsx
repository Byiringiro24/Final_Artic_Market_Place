'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Filter } from 'lucide-react';
import { get, del, put } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
  id: string; name: string; slug: string; price: number; countInStock: number;
  isPublished: boolean; isFeatured: boolean; numSales: number; createdAt: string;
  images: string[]; category: { name: string };
}
interface ApiData { data: Product[]; pagination: { total: number; totalPages: number; page: number } }

export default function AdminProductsPage() {
  const locale = useLocale();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => get<ApiData['data']>(`/products?limit=20&page=${page}${search ? `&search=${search}` : ''}`),
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id: string) => del(`/products/${id}`),
    onSuccess: () => { toast({ title: 'Product deleted' }); qc.invalidateQueries({ queryKey: ['admin-products'] }); },
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

      {/* Search + filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
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
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No products found</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 border rounded flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.images?.[0] || '/images/placeholder.jpg'} alt={product.name} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(product.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category?.name}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.countInStock === 0 ? 'text-red-600 font-medium' : product.countInStock <= 5 ? 'text-orange-600 font-medium' : ''}>
                        {product.countInStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{product.numSales}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePublish({ id: product.id, isPublished: !product.isPublished })}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          product.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        aria-label={product.isPublished ? 'Unpublish product' : 'Publish product'}
                      >
                        {product.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {product.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/${locale}/admin/products/${product.id}`} className="p-1.5 text-gray-500 hover:text-artic-orange hover:bg-orange-50 rounded transition-colors" aria-label="Edit product">
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => { if (confirm('Delete this product?')) deleteProduct(product.id); }}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          aria-label="Delete product"
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
            <span className="text-gray-500">Total: {pagination.total} products</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <span className="px-3 py-1 text-sm">{page} / {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
