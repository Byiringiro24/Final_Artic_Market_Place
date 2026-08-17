'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

interface Category { id: string; name: string; slug: string }

// Static quick links that always appear
const STATIC_LINKS = [
  { label: "Today's Deals", href: '/deals', emoji: '🔥' },
  { label: 'New Arrivals', href: '/search?sort=newest', emoji: '✨' },
  { label: 'Prime Deals', href: '/search?featured=true', emoji: '⚡' },
  { label: 'Services', href: '/services', emoji: '🛠' },
  { label: 'Sell on ARTIC', href: '/sell', emoji: '💼' },
  { label: 'Customer Service', href: '/customer-service', emoji: '💬' },
];

export default function SlidingNavBar() {
  const locale = useLocale();

  const { data } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => get<Category[]>('/categories'),
    staleTime: 10 * 60 * 1000,
  });

  const categories = (data?.data as unknown as Category[]) || [];

  // Build the full link list: static links + dynamic categories
  const allLinks = [
    ...STATIC_LINKS.map((l) => ({ label: l.label, href: `/${locale}${l.href}`, emoji: l.emoji, isCategory: false })),
    ...categories.map((c) => ({ label: c.name, href: `/${locale}/categories/${c.slug}`, emoji: '', isCategory: true })),
  ];

  // Duplicate the list for seamless infinite scroll
  const doubled = [...allLinks, ...allLinks];

  return (
    <div className="flex-1 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-artic-navy-light to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-artic-navy-light to-transparent z-10 pointer-events-none" />

      {/* Sliding track */}
      <div className="nav-scroll-track">
        {doubled.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className="flex items-center gap-1 text-sm text-gray-200 hover:text-artic-teal hover:bg-white/10 px-3 py-1 rounded transition-colors whitespace-nowrap flex-shrink-0 group"
          >
            {link.emoji && <span className="text-xs">{link.emoji}</span>}
            <span className="group-hover:underline">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
