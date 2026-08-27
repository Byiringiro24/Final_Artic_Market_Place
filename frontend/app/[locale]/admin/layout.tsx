'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  FileText, Settings, Star, Megaphone, Image as ImageIcon, Truck,
  BarChart3, ChevronRight, LogOut, Menu, X, Store, Wrench, Phone,
  Bell, ShoppingCart, Camera,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useAdminNotifications, AdminSseEvent } from '@/hooks/useAdminNotifications';
import { get } from '@/lib/api';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Overview',       icon: LayoutDashboard, href: '/admin/overview' },
  { label: 'Products',       icon: Package,         href: '/admin/products' },
  { label: 'Categories',     icon: Tag,             href: '/admin/categories' },
  { label: 'Orders',         icon: ShoppingBag,     href: '/admin/orders' },
  { label: 'Users',          icon: Users,           href: '/admin/users' },
  { label: 'Sellers',        icon: Store,           href: '/admin/sellers' },
  { label: 'Services',       icon: Wrench,          href: '/admin/services' },
  { label: 'Reviews',        icon: Star,            href: '/admin/reviews' },
  { label: 'Promotions',     icon: Megaphone,       href: '/admin/promotions' },
  { label: 'Banners',        icon: ImageIcon,           href: '/admin/banners' },
  { label: 'Web Pages',      icon: FileText,        href: '/admin/web-pages' },
  { label: 'Shipping',       icon: Truck,           href: '/admin/shipping' },
  { label: 'Reports',        icon: BarChart3,       href: '/admin/reports' },
  { label: 'Contact & Social', icon: Phone,         href: '/admin/contact' },
  { label: 'Settings',       icon: Settings,        href: '/admin/settings' },
];

interface LiveAlert { id: string; type: 'NEW_ORDER' | 'PAYMENT_PROOF'; message: string; orderId?: string; orderNumber?: string; at: Date }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const locale    = useLocale();
  const qc        = useQueryClient();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [liveAlerts, setLiveAlerts]     = useState<LiveAlert[]>([]);
  const [bellOpen, setBellOpen]         = useState(false);

  // Load initial unread count
  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) return;
    get<{ unreadCount: number }>('/notifications')
      .then((res) => {
        const d = res.data as unknown as { unreadCount: number };
        setUnreadCount(d?.unreadCount ?? 0);
      })
      .catch(() => {});
  }, [isAuthenticated, isAdmin]);

  const handleSseEvent = useCallback((event: AdminSseEvent) => {
    if (event.type === 'PING') return;

    const alert: LiveAlert = {
      id: Date.now().toString(),
      type: event.type,
      message: event.message || '',
      orderId: event.orderId,
      orderNumber: event.orderNumber,
      at: new Date(),
    };

    setLiveAlerts((prev) => [alert, ...prev].slice(0, 10));
    setUnreadCount((c) => c + 1);

    // Invalidate orders queries so lists refresh automatically
    qc.invalidateQueries({ queryKey: ['admin-orders'] });
    qc.invalidateQueries({ queryKey: ['admin-notifications'] });
  }, [qc]);

  useAdminNotifications(handleSseEvent);

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

        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {NAV.map(({ label, icon: Icon, href }) => {
            const fullHref = `/${locale}${href}`;
            const active   = pathname.startsWith(fullHref);
            return (
              <Link
                key={href} href={fullHref}
                title={!sidebarOpen ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  active ? 'bg-artic-teal text-white font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && label}
                {/* Badge for orders with pending proof */}
                {sidebarOpen && label === 'Orders' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

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
          <nav className="flex items-center gap-1 text-sm text-gray-500" aria-label="Breadcrumb">
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
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setBellOpen((v) => !v); if (!bellOpen) setUnreadCount(0); }}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {bellOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <p className="font-semibold text-sm">Live Notifications</p>
                    <button onClick={() => setBellOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {liveAlerts.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No new notifications
                    </div>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto divide-y">
                      {liveAlerts.map((alert) => (
                        <li key={alert.id}>
                          <Link
                            href={alert.orderId ? `/${locale}/admin/orders/${alert.orderId}` : `/${locale}/admin/orders`}
                            onClick={() => setBellOpen(false)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                              alert.type === 'PAYMENT_PROOF' ? 'bg-yellow-100' : 'bg-green-100'
                            )}>
                              {alert.type === 'PAYMENT_PROOF'
                                ? <Camera className="h-4 w-4 text-yellow-600" />
                                : <ShoppingCart className="h-4 w-4 text-green-600" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-800 truncate">{alert.message}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {alert.at.toLocaleTimeString()}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="border-t p-2">
                    <Link
                      href={`/${locale}/admin/orders`}
                      onClick={() => setBellOpen(false)}
                      className="block text-center text-xs text-artic-teal hover:underline py-1"
                    >
                      View all orders →
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
