'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard, Package, ShoppingBag,
  Users, Settings, Tag, X
} from 'lucide-react';
import { useState } from 'react';

export default function AdminBar() {
  const locale = useLocale();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  if (!isAuthenticated || !isAdmin() || dismissed) return null;

  const links = [
    { label: 'Dashboard', href: '/admin/overview', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Categories', href: '/admin/categories', icon: Tag },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="bg-artic-navy-light border-b border-white/10 text-white text-xs">
      <div className="max-w-[1500px] mx-auto px-4 h-8 flex items-center gap-1">
        {/* Admin badge */}
        <span className="bg-artic-orange text-black text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0 mr-2">
          ADMIN MODE
        </span>

        {/* Quick links */}
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide flex-1">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={`/${locale}${href}`}
              className="flex items-center gap-1 text-gray-300 hover:text-artic-orange transition-colors px-2 py-1 rounded whitespace-nowrap flex-shrink-0"
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          ))}
        </div>

        {/* View store link */}
        <Link
          href={`/${locale}`}
          className="text-gray-400 hover:text-white text-[10px] flex-shrink-0 ml-2 whitespace-nowrap"
        >
          ← Store View
        </Link>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 text-gray-500 hover:text-gray-300 flex-shrink-0"
          aria-label="Dismiss admin bar"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
