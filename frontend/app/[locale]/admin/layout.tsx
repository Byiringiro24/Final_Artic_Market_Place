'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  FileText, Settings, Star, Megaphone, Image, Truck,
  BarChart3, ChevronRight, LogOut, Menu, X, Store, Wrench, Phone,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin/overview' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Categories', icon: Tag, href: '/admin/categories' },
  { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Sellers', icon: Store, href: '/admin/sellers' },
  { label: 'Services', icon: Wrench, href: '/admin/services' },
  { label: 'Reviews', icon: Star, href: '/admin/reviews' },
  { label: 'Promotions', icon: Megaphone, href: '/admin/promotions' },
  { label: 'Banners', icon: Image, href: '/admin/banners' },
  { label: 'Web Pages', icon: FileText, href: '/admin/web-pages' },
  { label: 'Shipping', icon: Truck, href: '/admin/shipping' },
  { label: 'Reports', icon: BarChart3, href: '/admin/reports' },
  { label: 'Contact & Social', icon: Phone, href: '/admin/contact' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.replace(`/${locale}/sign-in?redirect=${pathname}`);
    }
  }, [isAuthenticated, isAdmin, locale, pathname, router]);

  if (!isAuthenticated || !isAdmin()) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        'bg-artic-navy text-white flex-shrink-0 flex flex-col transition-all duration-200',
        sidebarOpen ? 'w-56' : 'w-16'
      )}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-white/10 gap-3">
          <button onClick={() => setSidebarOpen((v) => !v)} className="text-white/70 hover:text-white" aria-label="Toggle sidebar">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {sidebarOpen && (
            <Link href={`/${locale}/admin/overview`} className="flex items-center gap-2">
              <div className="bg-artic-teal rounded px-1.5 py-0.5 text-black font-black text-sm">A</div>
              <span className="font-semibold text-sm">Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {NAV.map(({ label, icon: Icon, href }) => {
            const fullHref = `/${locale}${href}`;
            const active = pathname.startsWith(fullHref);
            return (
              <Link
                key={href}
                href={fullHref}
                title={!sidebarOpen ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  active ? 'bg-artic-teal text-white font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-white/10 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-artic-teal flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user?.name}</p>
                <p className="text-xs text-white/50 truncate">{user?.email}</p>
              </div>
              <button onClick={() => { logout(); router.push(`/${locale}`); }} className="ml-auto text-white/50 hover:text-red-400" aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => { logout(); router.push(`/${locale}`); }} className="text-white/50 hover:text-red-400 mx-auto block" aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b flex items-center px-6 gap-4">
          <nav className="flex items-center gap-1 text-sm text-gray-500">
            {pathname.split('/').filter(Boolean).slice(1).map((seg, i, arr) => (
              <span key={seg} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={i === arr.length - 1 ? 'text-gray-800 font-medium' : ''}>
                  {seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link href={`/${locale}`} target="_blank" className="text-xs text-artic-link hover:underline">
              View Store ↗
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
