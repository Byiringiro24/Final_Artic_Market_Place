'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
}

export default function CategoryGrid() {
  const locale = useLocale();
  const { data } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => get<Category[]>('/categories'),
    staleTime: 10 * 60 * 1000,
  });

  const categories = (data?.data || []).filter((c) => !('parentId' in c && c.parentId));

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/${locale}/categories/${cat.slug}`}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-artic-light-bg flex items-center justify-center overflow-hidden group-hover:ring-2 ring-artic-orange transition-all">
              {cat.image ? (
                <Image src={cat.image} alt={cat.name} width={64} height={64} className="object-cover" />
              ) : (
                <span className="text-2xl">{cat.icon || '🛍️'}</span>
              )}
            </div>
            <span className="text-xs font-medium text-center leading-tight group-hover:text-artic-link">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
