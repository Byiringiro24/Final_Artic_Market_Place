'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { TrendingUp, Flame } from 'lucide-react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import ProductCard, { ProductCardProps } from '@/components/product/ProductCard';

export default function TrendingSection() {
  const locale = useLocale();

  const { data } = useQuery({
    queryKey: queryKeys.products.list({ sort: 'best_selling', limit: '6' }),
    queryFn: () => get<ProductCardProps[]>('/products?sort=best_selling&limit=6'),
  });

  const products = (data?.data as unknown as ProductCardProps[]) || [];
  if (!products.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-[#FFB800] rounded-full" />
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Flame className="h-6 w-6 text-[#FFB800]" /> Trending Now
            </h2>
            <p className="text-sm text-gray-500">Most popular this week</p>
          </div>
        </div>
        <Link href={`/${locale}/search?sort=best_selling`} className="text-[#18A89A] hover:underline text-sm font-semibold flex items-center gap-1">
          See all <TrendingUp className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {products.map((p) => <ProductCard key={p.id} {...p} />)}
      </div>
    </section>
  );
}
