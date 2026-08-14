'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import ProductCard, { ProductCardProps } from '@/components/product/ProductCard';

export default function DealsSection() {
  const locale = useLocale();
  const { data } = useQuery({
    queryKey: queryKeys.products.list({ sort: 'price_asc', limit: '6' }),
    queryFn: () => get<ProductCardProps[]>('/products?sort=price_asc&limit=6'),
  });

  const products = data?.data || [];
  if (!products.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Today&apos;s Deals</h2>
        <Link
          href={`/${locale}/deals`}
          className="text-artic-link hover:text-artic-link-hover hover:underline text-sm"
        >
          See all deals
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    </section>
  );
}
