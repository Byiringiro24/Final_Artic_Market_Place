'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { TrendingUp, Zap, Star } from 'lucide-react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import ProductCard, { ProductCardProps } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

export default function FeaturedProducts() {
  const locale = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: () => get<ProductCardProps[]>('/products/featured?limit=8'),
  });

  const products = (data?.data as unknown as ProductCardProps[]) || [];

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-[#18A89A] rounded-full" />
          <div>
            <h2 className="text-2xl font-black text-gray-900">Featured Products</h2>
            <p className="text-sm text-gray-500">Hand-picked by our team</p>
          </div>
          <div className="flex items-center gap-1 ml-2 bg-[#18A89A]/10 text-[#18A89A] text-xs font-semibold px-2.5 py-1 rounded-full">
            <Star className="h-3 w-3 fill-[#18A89A]" /> Top Rated
          </div>
        </div>
        <Link href={`/${locale}/search?featured=true`} className="text-[#18A89A] hover:text-[#0F7A70] text-sm font-semibold hover:underline flex items-center gap-1">
          View all <TrendingUp className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? <ProductGridSkeleton count={8} /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      )}
    </section>
  );
}
