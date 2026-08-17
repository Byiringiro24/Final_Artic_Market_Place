'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package, MapPin, Heart, Star, Bell, Settings, User, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Account Overview', href: '/account', icon: User },
  { label: 'Your Orders', href: '/account/orders', icon: Package },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Wish List', href: '/wishlist', icon: Heart },
  { label: 'Your Reviews', href: '/account/reviews', icon: Star },
  { label: 'Notifications', href: '/account/notifications', icon: Bell },
  { label: 'Account Settings', href: '/account/settings', icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/sign-in?redirect=${pathname}`);
    }
  }, [isAuthenticated, locale, pathname, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          {/* User info */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b">
            <div className="w-12 h-12 rounded-full bg-artic-teal flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const fullHref = `/${locale}${href}`;
              const isActive = href === '/account'
                ? pathname === fullHref
                : pathname.startsWith(fullHref);
              return (
                <Link
                  key={href}
                  href={fullHref}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-artic-teal/10 text-artic-teal-dark font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile breadcrumb */}
        <div className="md:hidden w-full mb-4">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Link href={`/${locale}/account`} className="hover:text-artic-link">Account</Link>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
