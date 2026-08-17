'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import ProductCard, { ProductCardProps } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';
import { Button } from '@/components/ui/button';

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Avg. Customer Review', value: 'rating_desc' },
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Best Sellers', value: 'best_selling' },
];

const PRICE_RANGES = [
  { label: 'Under $25', min: '0', max: '25' },
  { label: '$25 to $50', min: '25', max: '50' },
  { label: '$50 to $100', min: '50', max: '100' },
  { label: '$100 to $200', min: '100', max: '200' },
  { label: '$200 & Above', min: '200', max: '' },
];

interface ApiResponse { data: ProductCardProps[]; pagination: { total: number; totalPages: number; page: number } }

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'featured';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = searchParams.get('page') || '1';
  const rating = searchParams.get('rating') || '';

  const params: Record<string, string> = { page, limit: '24', sort };
  if (search) params.search = search;
  if (category) params.category = category;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  if (rating) params.rating = rating;

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => get<ApiResponse['data']>('/products', params),
  });

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    router.push(`${pathname}?${p.toString()}`);
  }

  const products = (data?.data as unknown as ProductCardProps[]) || [];
  const pagination = (data as unknown as ApiResponse)?.pagination;
  const total = pagination?.total || 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          {search ? (
            <h1 className="text-lg">
              {total.toLocaleString()} results for{' '}
              <span className="text-red-700">&quot;{search}&quot;</span>
            </h1>
          ) : (
            <h1 className="text-lg font-medium">{category || 'All Products'}</h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2 lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="border rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-artic-teal"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={`w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="space-y-6">
            {/* Price range */}
            <div>
              <h3 className="font-semibold text-sm mb-3 border-b pb-2">Price</h3>
              <ul className="space-y-2">
                {PRICE_RANGES.map((r) => (
                  <li key={r.label}>
                    <button
                      onClick={() => { updateParam('minPrice', r.min); updateParam('maxPrice', r.max); }}
                      className={`text-sm hover:text-artic-link transition-colors ${
                        minPrice === r.min && maxPrice === r.max ? 'text-artic-teal font-medium' : 'text-artic-link'
                      }`}
                    >
                      {r.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rating filter */}
            <div>
              <h3 className="font-semibold text-sm mb-3 border-b pb-2">Avg. Customer Review</h3>
              <ul className="space-y-2">
                {[4, 3, 2, 1].map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => updateParam('rating', rating === String(r) ? '' : String(r))}
                      className={`flex items-center gap-1 text-sm hover:text-artic-link ${rating === String(r) ? 'text-artic-teal font-medium' : 'text-artic-link'}`}
                    >
                      {'★'.repeat(r)}{'☆'.repeat(5 - r)} & Up
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clear filters */}
            {(minPrice || maxPrice || rating) && (
              <button
                onClick={() => { updateParam('minPrice', ''); updateParam('maxPrice', ''); updateParam('rating', ''); }}
                className="text-xs text-artic-link hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <ProductGridSkeleton count={24} />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-4">No results found</p>
              {search && <p className="text-gray-500">Try different keywords or remove filters</p>}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map((p) => <ProductCard key={p.id} {...p} />)}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8 flex-wrap">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParam('page', String(p))}
                      className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
                        p === pagination.page
                          ? 'bg-artic-teal text-black'
                          : 'border hover:bg-gray-50'
                      }`}
                      aria-label={`Page ${p}`}
                      aria-current={p === pagination.page ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
