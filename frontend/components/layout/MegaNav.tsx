'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Menu, X, ChevronRight } from 'lucide-react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  children?: Category[];
}

// Static well-known sub-groups per top-level category
const SUBCATEGORY_MAP: Record<string, string[]> = {
  electronics: ['Phones & Tablets', 'Computers & Laptops', 'Audio & Headphones', 'Cameras', 'Smart Home', 'Gaming', 'Accessories'],
  fashion: ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Shoes', 'Bags & Luggage', 'Jewelry & Watches', 'Accessories'],
  'home-kitchen': ['Furniture', 'Kitchen & Dining', 'Bedding & Bath', 'Storage', 'Decor', 'Garden & Outdoor', 'Tools'],
  'sports-outdoors': ['Exercise & Fitness', 'Outdoor Recreation', 'Team Sports', 'Water Sports', 'Cycling', 'Footwear'],
  'phones': ['Smartphones', 'Feature Phones', 'Phone Cases', 'Chargers & Cables', 'Screen Protectors'],
};

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻', fashion: '👗', 'home-kitchen': '🏠', 'sports-outdoors': '⚽',
  phones: '📱', laptops: '💻', audio: '🎧', gaming: '🎮',
  default: '📦',
};

export default function MegaNav() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => get<Category[]>('/categories'),
    staleTime: 10 * 60 * 1000,
  });

  const categories = (data?.data as unknown as Category[]) || [];
  const topLevel = categories.filter((c) => !c.children?.length === false || true);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const subs = activeCategory ? (SUBCATEGORY_MAP[activeCategory.slug] || []) : [];

  return (
    <div ref={menuRef} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        All
      </button>

      {open && (
        <div className="absolute top-full left-0 z-[200] flex bg-white shadow-2xl rounded-b-lg border border-gray-100 animate-fade-in" style={{ minWidth: 560 }}>
          {/* Left: top-level categories */}
          <div className="w-52 border-r bg-gray-50 py-2 rounded-bl-lg">
            <p className="text-[10px] font-bold text-gray-400 uppercase px-4 pb-1 pt-2 tracking-wider">Browse by Category</p>
            {topLevel.map((cat) => (
              <button
                key={cat.id}
                onMouseEnter={() => setActiveCategory(cat)}
                onClick={() => { setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                  activeCategory?.id === cat.id ? 'bg-artic-teal/10 text-artic-teal font-semibold' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.default}</span>
                  {cat.name}
                </span>
                {subs.length > 0 && activeCategory?.id === cat.id && <ChevronRight className="h-3 w-3" />}
              </button>
            ))}
            <div className="border-t mt-2 pt-2 px-4">
              <Link
                href={`/${locale}/services`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm text-artic-teal hover:text-artic-teal font-medium py-1"
              >
                🛠 Services
              </Link>
              <Link
                href={`/${locale}/deals`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm text-artic-teal hover:text-artic-teal font-medium py-1"
              >
                🔥 Today&apos;s Deals
              </Link>
            </div>
          </div>

          {/* Right: subcategories */}
          {activeCategory && subs.length > 0 ? (
            <div className="flex-1 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>{CATEGORY_ICONS[activeCategory.slug] || '📦'}</span>
                {activeCategory.name}
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {subs.map((sub) => (
                  <Link
                    key={sub}
                    href={`/${locale}/categories/${activeCategory.slug}?sub=${encodeURIComponent(sub)}`}
                    onClick={() => setOpen(false)}
                    className="text-sm text-gray-600 hover:text-artic-teal hover:translate-x-1 transition-all py-1 block"
                  >
                    {sub}
                  </Link>
                ))}
                <Link
                  href={`/${locale}/categories/${activeCategory.slug}`}
                  onClick={() => setOpen(false)}
                  className="text-sm text-artic-teal font-semibold hover:underline py-1 block col-span-2 mt-2"
                >
                  View all in {activeCategory.name} →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-5">
              {activeCategory ? (
                <>
                  <h3 className="font-bold text-gray-800 mb-3">{activeCategory.name}</h3>
                  <Link
                    href={`/${locale}/categories/${activeCategory.slug}`}
                    onClick={() => setOpen(false)}
                    className="text-sm text-artic-teal font-semibold hover:underline"
                  >
                    View all in {activeCategory.name} →
                  </Link>
                </>
              ) : (
                <div className="text-gray-400 text-sm flex items-center h-full">
                  Hover a category to see subcategories
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
