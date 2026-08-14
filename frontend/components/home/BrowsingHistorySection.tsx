'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/store/auth.store';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import ProductCard, { ProductCardProps } from '@/components/product/ProductCard';

export default function BrowsingHistorySection() {
  const locale = useLocale();
  const { isAuthenticated } = useAuthStore();

  const { data } = useQuery({
    queryKey: queryKeys.products.history(),
    queryFn: () => get<ProductCardProps[]>('/products/me/browsing-history'),
    enabled: isAuthenticated,
  });

  const products = data?.data || [];
  if (!isAuthenticated || !products.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Your Browsing History</h2>
        <Link href={`/${locale}/search`} className="text-artic-link hover:underline text-sm">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.slice(0, 6).map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    </section>
  );
}
