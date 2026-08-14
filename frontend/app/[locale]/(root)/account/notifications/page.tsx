'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { get, put, del } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string; type: string; title: string; message: string;
  isRead: boolean; link?: string; createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  ORDER_PLACED: '📦', ORDER_CONFIRMED: '✅', ORDER_SHIPPED: '🚚',
  ORDER_DELIVERED: '🎉', ORDER_CANCELLED: '❌', REVIEW_APPROVED: '⭐',
  PRICE_DROP: '💰', BACK_IN_STOCK: '🔔', PROMOTIONAL: '🎁', SYSTEM: 'ℹ️',
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => get<{ notifications: Notification[]; unreadCount: number }>('/notifications'),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => put('/notifications/read-all', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => put(`/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });

  const { mutate: deleteNotification } = useMutation({
    mutationFn: (id: string) => del(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });

  const notifications = (data?.data as unknown as { notifications: Notification[] })?.notifications || [];
  const unreadCount = (data?.data as unknown as { unreadCount: number })?.unreadCount || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-artic-orange text-black text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead()} className="gap-2">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-20 rounded-lg" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-lg">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex gap-4 p-4 rounded-lg border transition-colors ${
                n.isRead ? 'bg-white' : 'bg-orange-50 border-orange-100'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  if (!n.isRead) markRead(n.id);
                  if (n.link) window.location.href = n.link;
                }}
              >
                <p className={`text-sm font-medium ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                  {n.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
              </div>
              <button
                onClick={() => deleteNotification(n.id)}
                className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                aria-label="Delete notification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
