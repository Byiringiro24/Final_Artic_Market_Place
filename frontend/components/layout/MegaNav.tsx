'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Menu, ChevronRight, X } from 'lucide-react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

interface Category { id: string; name: string; slug: string }

// Rich subcategory map with sub-groups
const CATEGORY_DATA: Record<string, { icon: string; groups: { name: string; items: string[] }[] }> = {
  electronics: {
    icon: '💻',
    groups: [
      { name: 'Phones & Tablets', items: ['Smartphones', 'Tablets', 'Feature Phones', 'Phone Cases', 'Chargers'] },
      { name: 'Computers', items: ['Laptops', 'Desktops', 'Monitors', 'Keyboards', 'Printers'] },
      { name: 'Audio & TV', items: ['Headphones', 'Speakers', 'Smart TVs', 'Home Theater', 'Streaming'] },
      { name: 'Gaming & Smart', items: ['Gaming Consoles', 'Games', 'Smart Home', 'Cameras', 'Drones'] },
    ],
  },
  fashion: {
    icon: '👗',
    groups: [
      { name: "Men's Fashion", items: ["T-Shirts", "Trousers", "Suits", "Shoes", "Watches", "Bags"] },
      { name: "Women's Fashion", items: ["Dresses", "Tops", "Heels", "Handbags", "Jewelry", "Perfume"] },
      { name: "Kids' Fashion", items: ["Boys' Clothing", "Girls' Clothing", "School Uniforms", "Baby Wear"] },
      { name: 'Accessories', items: ['Sunglasses', 'Belts', 'Hats', 'Socks', 'Scarves'] },
    ],
  },
  'home-kitchen': {
    icon: '🏠',
    groups: [
      { name: 'Furniture', items: ['Sofas', 'Beds', 'Tables', 'Chairs', 'Wardrobes', 'Shelves'] },
      { name: 'Kitchen', items: ['Cookware', 'Appliances', 'Utensils', 'Storage', 'Coffee Makers'] },
      { name: 'Decor & Bedding', items: ['Cushions', 'Curtains', 'Bed Sheets', 'Towels', 'Rugs'] },
      { name: 'Garden & Tools', items: ['Outdoor Furniture', 'Garden Tools', 'Power Tools', 'Lighting'] },
    ],
  },
  'sports-outdoors': {
    icon: '⚽',
    groups: [
      { name: 'Fitness', items: ['Gym Equipment', 'Yoga', 'Running', 'Cycling', 'Swimming'] },
      { name: 'Team Sports', items: ['Football', 'Basketball', 'Volleyball', 'Cricket', 'Tennis'] },
      { name: 'Outdoor', items: ['Camping', 'Hiking', 'Climbing', 'Fishing', 'Water Sports'] },
      { name: 'Sports Gear', items: ['Shoes', 'Clothing', 'Bags', 'Nutrition', 'Accessories'] },
    ],
  },
};

const DEFAULT_ICON_MAP: Record<string, string> = {
  electronics: '💻', fashion: '👗', 'home-kitchen': '🏠',
  'sports-outdoors': '⚽', phones: '📱', groceries: '🛒',
  beauty: '💄', cars: '🚗', farming: '🌾', building: '🏗',
};

// Static top-level nav links for the menu sidebar
const STATIC_ITEMS = [
  { label: "Today's Deals", href: '/deals', icon: '🔥' },
  { label: 'New Arrivals', href: '/search?sort=newest', icon: '✨' },
  { label: 'Services', href: '/services', icon: '🛠' },
  { label: 'Sell on ARTIC', href: '/sell', icon: '💼' },
  { label: 'Help & Support', href: '/customer-service', icon: '💬' },
];

export default function MegaNav() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => get<Category[]>('/categories'),
    staleTime: 10 * 60 * 1000,
  });

  const categories = (data?.data as unknown as Category[]) || [];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveSlug(null);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const activeCatData = activeSlug ? CATEGORY_DATA[activeSlug] : null;
  const activeCat = categories.find((c) => c.slug === activeSlug);

  return (
    <div ref={menuRef} className="relative flex-shrink-0 self-stretch flex items-stretch">
      {/* Trigger button */}
      <button
        onClick={() => { setOpen((v) => !v); if (!activeSlug && categories.length) setActiveSlug(categories[0]?.slug); }}
        onMouseEnter={() => { setOpen(true); if (!activeSlug && categories.length) setActiveSlug(categories[0]?.slug); }}
        className={`flex items-center gap-2 px-4 text-sm font-bold transition-colors self-stretch ${
          open ? 'bg-[#18A89A] text-white' : 'text-white hover:bg-white/10'
        }`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" />
        All
      </button>

      {/* MEGA DROPDOWN — full height, from nav bottom to viewport */}
      {open && (
        <div
          className="fixed left-0 right-0 z-[300] flex shadow-2xl"
          style={{ top: 100, bottom: 0 }}
          onMouseLeave={() => { setOpen(false); setActiveSlug(null); }}
        >
          {/* Left sidebar: category list */}
          <div className="w-56 bg-[#1A2332] flex flex-col overflow-y-auto flex-shrink-0">
            <div className="px-4 py-2 border-b border-white/10">
              <p className="text-[10px] text-[#18A89A] font-bold uppercase tracking-wider">Browse Categories</p>
            </div>

            {categories.map((cat) => {
              const icon = DEFAULT_ICON_MAP[cat.slug] || '📦';
              const isActive = activeSlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => setActiveSlug(cat.slug)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors ${
                    isActive ? 'bg-[#18A89A] text-white font-semibold' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base w-5 text-center">{icon}</span>
                    {cat.name}
                  </span>
                  <ChevronRight className="h-3 w-3 opacity-60" />
                </button>
              );
            })}

            {/* Divider + static links */}
            <div className="border-t border-white/10 mt-2 pt-2">
              {STATIC_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[#18A89A] hover:bg-white/5 hover:text-white transition-colors"
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right panel: subcategory grid */}
          <div className="flex-1 bg-white overflow-y-auto">
            {activeCat && (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 pb-3 border-b">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">{DEFAULT_ICON_MAP[activeCat.slug] || '📦'}</span>
                    {activeCat.name}
                  </h2>
                  <Link
                    href={`/${locale}/categories/${activeCat.slug}`}
                    onClick={() => setOpen(false)}
                    className="text-sm text-[#18A89A] hover:underline font-medium"
                  >
                    View all →
                  </Link>
                </div>

                {/* Subgroups grid */}
                {activeCatData ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {activeCatData.groups.map((group) => (
                      <div key={group.name}>
                        <h3 className="text-xs font-bold text-[#18A89A] uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">
                          {group.name}
                        </h3>
                        <ul className="space-y-1">
                          {group.items.map((item) => (
                            <li key={item}>
                              <Link
                                href={`/${locale}/search?search=${encodeURIComponent(item)}&category=${activeCat.slug}`}
                                onClick={() => setOpen(false)}
                                className="text-sm text-gray-600 hover:text-[#18A89A] hover:translate-x-1 transition-all inline-block"
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <span className="text-6xl mb-4">{DEFAULT_ICON_MAP[activeCat.slug] || '📦'}</span>
                    <p className="text-lg font-medium mb-2">Explore {activeCat.name}</p>
                    <Link
                      href={`/${locale}/categories/${activeCat.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-[#18A89A] hover:underline text-sm"
                    >
                      Browse all products →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => { setOpen(false); setActiveSlug(null); }}
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
