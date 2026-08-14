'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import ProductCard, { ProductCardProps } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

interface Category { id: string; name: string; slug: string; description?: string; children?: Category[] }

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const locale = useLocale();

  const { data: catData } = useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: () => get<Category>(`/categories/${slug}`),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: queryKeys.products.list({ category: slug }),
    queryFn: () => get<ProductCardProps[]>(`/products?category=${slug}&limit=24`),
  });

  const category = catData?.data as unknown as Category;
  const products = (productsData?.data as unknown as ProductCardProps[]) || [];
  const total = (productsData as unknown as { pagination?: { total: number } })?.pagination?.total || products.length;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
        <Link href={`/${locale}`} className="hover:text-artic-link">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-800">{category?.name || slug}</span>
      </nav>

      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{category?.name || slug}</h1>
          {category?.description && (
            <p className="text-gray-500 text-sm mt-1">{category.description}</p>
          )}
        </div>
        <p className="text-sm text-gray-500">{total.toLocaleString()} results</p>
      </div>

      {/* Sub-categories */}
      {category?.children && category.children.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/${locale}/categories/${child.slug}`}
              className="px-4 py-2 border rounded-full text-sm hover:bg-artic-orange hover:text-black hover:border-artic-orange transition-colors"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {isLoading ? (
        <ProductGridSkeleton count={24} />
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-lg">
          <p className="text-xl text-gray-600">No products found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      )}
    </div>
  );
}
