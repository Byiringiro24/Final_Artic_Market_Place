'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { formatDate, formatPrice, getOrderStatusColor } from '@/lib/utils';

interface OrderItem { name: string; image: string; quantity: number }
interface Order { id: string; orderNumber: string; status: string; totalPrice: number; createdAt: string; items: OrderItem[] }

export default function OrdersPage() {
  const locale = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.orders.mine(),
    queryFn: () => get<Order[]>('/orders/my-orders'),
  });

  const orders = (data?.data as unknown as Order[]) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-lg" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-lg">
          <p className="text-xl text-gray-600 mb-4">No orders yet</p>
          <Link href={`/${locale}`} className="text-artic-link hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg overflow-hidden">
              {/* Order header */}
              <div className="bg-gray-50 px-4 py-3 flex flex-wrap items-center gap-4 text-sm border-b">
                <div><span className="text-gray-500">ORDER PLACED</span><br /><span className="font-medium">{formatDate(order.createdAt)}</span></div>
                <div><span className="text-gray-500">TOTAL</span><br /><span className="font-medium">{formatPrice(order.totalPrice)}</span></div>
                <div><span className="text-gray-500">STATUS</span><br />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="ml-auto">
                  <span className="text-gray-500">ORDER # </span>
                  <span className="font-medium text-artic-link">{order.orderNumber}</span>
                </div>
              </div>

              {/* Order items preview */}
              <div className="p-4 flex items-center gap-4">
                <div className="flex gap-2 flex-wrap flex-1">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-16 h-16 bg-gray-50 border rounded overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image || '/images/placeholder.jpg'} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/${locale}/account/orders/${order.id}`}
                    className="border border-artic-orange text-artic-orange-dark text-sm px-4 py-2 rounded hover:bg-orange-50 transition-colors"
                  >
                    View Order
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
