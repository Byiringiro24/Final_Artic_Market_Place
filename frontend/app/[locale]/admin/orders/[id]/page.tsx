'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronRight, Loader2, MapPin, CreditCard,
  Truck, Package, User, Clock,
} from 'lucide-react';
import { get, put } from '@/lib/api';
import { usePrice } from '@/hooks/usePrice';
import { formatDate, getOrderStatusColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const statusSchema = z.object({
  status: z.string().min(1),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  note: z.string().optional(),
});
type StatusForm = z.infer<typeof statusSchema>;

const ORDER_STATUSES = [
  'PENDING', 'PENDING_PAYMENT_PROOF', 'PAYMENT_PROOF_SUBMITTED',
  'CONFIRMED', 'PROCESSING', 'SHIPPED',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED',
  'RETURN_REQUESTED', 'RETURNED',
];

interface OrderItem {
  id: string; name: string; image: string; price: number; quantity: number;
  variantInfo?: Record<string, string>; product: { slug: string };
}
interface StatusHistory { status: string; note?: string; createdAt: string }
interface Order {
  id: string; orderNumber: string; status: string; paymentMethod: string;
  paymentStatus: string; totalPrice: number; itemsPrice: number;
  shippingPrice: number; taxPrice: number; couponDiscount: number;
  isPaid: boolean; paidAt?: string; trackingNumber?: string; carrier?: string;
  adminNotes?: string; createdAt: string;
  paymentProof?: string;
  user: { id: string; name: string; email: string };
  shippingAddress: {
    fullName: string; street: string; city: string;
    province: string; postalCode: string; country: string; phone: string;
  };
  items: OrderItem[];
  statusHistory: StatusHistory[];
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const locale  = useLocale();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fmt = usePrice();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => get<Order>(`/orders/${id}`),
  });

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<StatusForm>({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: data?.data?.status || 'PENDING' },
  });

  const currentStatus = watch('status');

  const { mutate: updateStatus } = useMutation({
    mutationFn: (d: StatusForm) => put(`/orders/${id}/status`, d),
    onSuccess: () => {
      toast({ title: 'Order updated successfully' });
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  const { mutate: markPaid, isPending: markingPaid } = useMutation({
    mutationFn: () => put(`/orders/${id}/mark-paid`, {}),
    onSuccess: () => {
      toast({ title: '✅ Payment verified! Order confirmed.' });
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => toast({ title: 'Failed to mark as paid', variant: 'destructive' }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-lg" />)}
      </div>
    );
  }

  const order = data?.data;
  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link href={`/${locale}/admin/orders`} className="text-artic-link hover:underline mt-2 block">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href={`/${locale}/admin/orders`} className="hover:text-artic-link">Orders</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-800 font-medium">{order.orderNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">Placed {formatDate(order.createdAt)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5">
        {/* Left */}
        <div className="space-y-5">
          {/* Update status form */}
          <div className="bg-white border rounded-lg p-5">
            <h2 className="font-semibold mb-4">Update Order Status</h2>
            <form onSubmit={handleSubmit((d) => updateStatus(d))} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <select
                    {...register('status')}
                    defaultValue={order.status}
                    className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Carrier</Label>
                  <Input
                    className="mt-1"
                    placeholder="DHL, FedEx, UPS..."
                    defaultValue={order.carrier || ''}
                    {...register('carrier')}
                  />
                </div>
              </div>

              {['SHIPPED', 'OUT_FOR_DELIVERY'].includes(currentStatus) && (
                <div>
                  <Label>Tracking Number</Label>
                  <Input
                    className="mt-1"
                    placeholder="1Z999AA10123456784"
                    defaultValue={order.trackingNumber || ''}
                    {...register('trackingNumber')}
                  />
                </div>
              )}

              <div>
                <Label>Admin Note (sent to customer in email)</Label>
                <textarea
                  {...register('note')}
                  rows={2}
                  placeholder="Optional note..."
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-lg gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Status
              </Button>
            </form>
          </div>

          {/* Order items */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              <h2 className="font-semibold">Order Items ({order.items.length})</h2>
            </div>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-50 border rounded flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/product/${item.product.slug}`}
                      target="_blank"
                      className="text-sm font-medium hover:text-artic-link line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.variantInfo && (
                      <p className="text-xs text-gray-500">
                        {Object.entries(item.variantInfo).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{fmt(Number(item.price) * item.quantity)}</p>
                    <p className="text-xs text-gray-400">{fmt(Number(item.price))} each</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Status history */}
          {order.statusHistory.length > 0 && (
            <div className="bg-white border rounded-lg p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" /> Status Timeline
              </h2>
              <ol className="relative border-l-2 border-gray-200 ml-2 space-y-4">
                {order.statusHistory.map((h, i) => (
                  <li key={i} className="ml-5">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-artic-teal border-2 border-white" />
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-medium text-sm">{h.status.replace(/_/g, ' ')}</p>
                      <time className="text-xs text-gray-400 flex-shrink-0">{formatDate(h.createdAt)}</time>
                    </div>
                    {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" /> Customer
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-artic-teal flex items-center justify-center text-black font-bold">
                {order.user.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{order.user.name}</p>
                <a href={`mailto:${order.user.email}`} className="text-xs text-artic-link hover:underline">
                  {order.user.email}
                </a>
              </div>
            </div>
            <Link
              href={`/${locale}/admin/users`}
              className="text-xs text-artic-link hover:underline block"
            >
              View customer profile →
            </Link>
          </div>

          {/* Shipping address */}
          <div className="bg-white border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" /> Ship to
            </h2>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-gray-400">{order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" /> Payment
            </h2>
            <p className="text-sm font-medium">
              {order.paymentMethod === 'STRIPE' && '💳 Stripe'}
              {order.paymentMethod === 'PAYPAL' && '🅿️ PayPal'}
              {order.paymentMethod === 'CASH_ON_DELIVERY' && '💵 Cash on Delivery'}
              {order.paymentMethod === 'MTN_MOMO' && '📱 MTN MoMo'}
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.isPaid ? '✓ Paid' : 'Awaiting Payment'}
              </span>
              {order.paidAt && <span className="text-xs text-gray-400">{formatDate(order.paidAt)}</span>}
            </div>

            {/* MTN MoMo payment proof */}
            {order.paymentMethod === 'MTN_MOMO' && (
              <div className="space-y-3 pt-1">
                {order.status === 'PAYMENT_PROOF_SUBMITTED' && !order.isPaid && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 font-medium">
                    📸 Customer submitted payment proof — please verify and confirm payment below.
                  </div>
                )}

                {order.paymentProof ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">Payment Screenshot:</p>
                    <a href={order.paymentProof} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.paymentProof}
                        alt="MoMo payment proof"
                        className="w-full rounded-lg border cursor-zoom-in hover:opacity-90 transition-opacity max-h-64 object-contain bg-gray-50"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </a>
                    <p className="text-[10px] text-gray-400">Click image to view full size</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No payment proof uploaded yet.</p>
                )}

                {!order.isPaid && (
                  <Button
                    onClick={() => markPaid()}
                    disabled={markingPaid}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg gap-2"
                  >
                    {markingPaid ? <Loader2 className="h-4 w-4 animate-spin" /> : '✓'}
                    Verify & Mark as Paid
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Items:</span>
                <span>{fmt(Number(order.itemsPrice))}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount:</span>
                  <span>-{fmt(Number(order.couponDiscount))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping:</span>
                <span>{order.shippingPrice === 0 ? <span className="text-green-700">FREE</span> : fmt(Number(order.shippingPrice))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax:</span>
                <span>{fmt(Number(order.taxPrice))}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-lg">{fmt(Number(order.totalPrice))}</span>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-white border rounded-lg p-4 space-y-2">
              <h2 className="font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" /> Tracking
              </h2>
              <p className="text-sm font-mono font-medium">{order.trackingNumber}</p>
              {order.carrier && <p className="text-xs text-gray-500">via {order.carrier}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
