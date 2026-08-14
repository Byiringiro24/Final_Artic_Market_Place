'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import ProductCard, { ProductCardProps } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

export default function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: () => get<ProductCardProps[]>('/products/featured?limit=8'),
  });

  if (isLoading) return <ProductGridSkeleton count={8} />;
  const products = data?.data || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
