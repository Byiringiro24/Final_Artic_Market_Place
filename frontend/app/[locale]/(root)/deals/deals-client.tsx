'use client';

import { useQuery } from '@tanstack/react-query';
import { Tag } from 'lucide-react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import ProductCard, { ProductCardProps } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

export default function DealsClient() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.list({ sort: 'price_asc', limit: '48' }),
    queryFn: () => get<ProductCardProps[]>('/products?sort=price_asc&limit=48'),
  });

  const products = (data?.data as unknown as ProductCardProps[]) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-artic-orange rounded-lg">
          <Tag className="h-6 w-6 text-black" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Today&apos;s Deals</h1>
          <p className="text-sm text-gray-500">Deals refresh daily — shop while stocks last</p>
        </div>
      </div>

      {/* Deal highlight bar */}
      <div className="bg-gradient-to-r from-artic-orange to-artic-orange-dark rounded-xl p-4 mb-8 text-black flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-bold text-lg">🔥 Limited Time Offers</p>
          <p className="text-sm opacity-80">Use code <strong>WELCOME10</strong> for 10% off your first order</p>
        </div>
        <div className="bg-black/10 rounded-lg px-4 py-2 text-sm font-mono font-bold">
          WELCOME10
        </div>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={24} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
