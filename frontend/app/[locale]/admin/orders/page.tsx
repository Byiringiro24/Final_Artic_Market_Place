'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
import { get, put } from '@/lib/api';
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const STATUS_OPTIONS = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED'];

interface Order {
  id: string; orderNumber: string; status: string; totalPrice: number; createdAt: string;
  user: { name: string; email: string };
  items: Array<{ name: string; quantity: number }>;
  shippingAddress: { city: string; country: string };
}
interface ApiData { data: Order[]; pagination: { total: number; totalPages: number; page: number } }

export default function AdminOrdersPage() {
  const locale = useLocale();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, statusFilter],
    queryFn: () => get<ApiData['data']>(`/orders?limit=20&page=${page}${search ? `&search=${search}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      put(`/orders/${id}/status`, { status }),
    onSuccess: () => { toast({ title: 'Order status updated' }); qc.invalidateQueries({ queryKey: ['admin-orders'] }); setUpdatingId(null); },
    onError: () => { toast({ title: 'Update failed', variant: 'destructive' }); setUpdatingId(null); },
  });

  const orders = (data?.data as unknown as Order[]) || [];
  const pagination = (data as unknown as ApiData)?.pagination;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-artic-teal focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Destination</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/admin/orders/${order.id}`} className="text-artic-link hover:underline font-medium">
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user.name}</p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.items[0]?.name}
                      {order.items.length > 1 && <span className="text-xs text-gray-400"> +{order.items.length - 1}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{order.shippingAddress?.city}, {order.shippingAddress?.country}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(order.totalPrice)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => { setUpdatingId(order.id); updateStatus({ id: order.id, status: e.target.value }); }}
                        disabled={updatingId === order.id}
                        className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-artic-teal bg-white"
                        aria-label={`Update status for order ${order.orderNumber}`}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <span className="text-gray-500">Total: {pagination.total}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <span className="px-3 py-1">{page} / {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
