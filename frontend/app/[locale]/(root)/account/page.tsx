'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Package, MapPin, Heart, Star, Bell, Settings, ChevronRight } from 'lucide-react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';

interface OrderSummary { id: string; orderNumber: string; status: string; totalPrice: number; createdAt: string }

export default function AccountPage() {
  const locale = useLocale();
  const { user } = useAuthStore();

  const { data: ordersData } = useQuery({
    queryKey: queryKeys.orders.mine({ limit: '3' }),
    queryFn: () => get<OrderSummary[]>('/orders/my-orders?limit=3'),
  });

  const recentOrders = (ordersData?.data as unknown as OrderSummary[]) || [];

  const tiles = [
    { icon: Package, label: 'Your Orders', sub: 'Track, return, or buy again', href: `/${locale}/account/orders` },
    { icon: MapPin, label: 'Your Addresses', sub: 'Edit or add addresses', href: `/${locale}/account/addresses` },
    { icon: Heart, label: 'Wish List', sub: 'Your saved items', href: `/${locale}/wishlist` },
    { icon: Star, label: 'Your Reviews', sub: 'Reviews & contributions', href: `/${locale}/account/reviews` },
    { icon: Bell, label: 'Notifications', sub: 'Manage preferences', href: `/${locale}/account/notifications` },
    { icon: Settings, label: 'Account Settings', sub: 'Password, email, profile', href: `/${locale}/account/settings` },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Your Account</h1>

      {/* Account tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {tiles.map(({ icon: Icon, label, sub, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-start gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow group"
          >
            <div className="p-2 bg-artic-light-bg rounded-lg group-hover:bg-orange-50">
              <Icon className="h-6 w-6 text-artic-teal" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-gray-500">{sub}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 ml-auto mt-1 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent Orders</h2>
            <Link href={`/${locale}/account/orders`} className="text-artic-link hover:underline text-sm">
              View all orders
            </Link>
          </div>
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{order.status}</span>
                </div>
                <Link href={`/${locale}/account/orders/${order.id}`} className="text-artic-link hover:underline text-sm ml-4">
                  Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
