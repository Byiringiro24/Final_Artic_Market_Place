'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

interface Category { id: string; name: string; slug: string }

const QUICK_LINKS = [
  { label: "Today's Deals", href: '/deals' },
  { label: 'New Arrivals', href: '/search?tags=new arrival' },
  { label: 'Customer Service', href: '/page/faq' },
  { label: 'Prime Deals', href: '/search?featured=true' },
];

export default function NavCategories() {
  const locale = useLocale();
  const { data } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => get<Category[]>('/categories'),
    staleTime: 10 * 60 * 1000,
  });

  const categories = (data?.data || []).slice(0, 6);

  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide" aria-label="Category navigation">
      {QUICK_LINKS.map((link) => (
        <Link
          key={link.label}
          href={`/${locale}${link.href}`}
          className="whitespace-nowrap text-white hover:bg-white/10 px-3 py-1 rounded text-sm transition-colors flex-shrink-0"
        >
          {link.label}
        </Link>
      ))}
      <span className="text-white/30 text-xs mx-1">|</span>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/${locale}/categories/${cat.slug}`}
          className="whitespace-nowrap text-white hover:bg-white/10 px-3 py-1 rounded text-sm transition-colors flex-shrink-0"
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
