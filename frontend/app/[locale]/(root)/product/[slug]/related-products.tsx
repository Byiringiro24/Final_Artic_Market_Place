'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import ProductCard, { ProductCardProps } from '@/components/product/ProductCard';

export default function RelatedProducts({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: queryKeys.products.related(slug),
    queryFn: () => get<ProductCardProps[]>(`/products/${slug}/related`),
  });

  const products = data?.data || [];
  if (!products.length) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Customers also viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.map((p) => <ProductCard key={p.id} {...p} />)}
      </div>
    </div>
  );
}
