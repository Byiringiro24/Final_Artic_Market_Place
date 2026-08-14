'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ChevronRight, Package, Truck, CheckCircle2,
  Clock, MapPin, CreditCard, RotateCcw, Printer,
} from 'lucide-react';
import { get, post } from '@/lib/api';
import { formatDate, formatPrice, getOrderStatusColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface StatusHistory { status: string; note?: string; createdAt: string }
interface OrderItem {
  id: string; name: string; image: string; price: number; quantity: number;
  variantInfo?: Record<string, string>;
  product: { slug: string };
}
interface Order {
  id: string; orderNumber: string; status: string; paymentMethod: string;
  paymentStatus: string; totalPrice: number; itemsPrice: number;
  shippingPrice: number; taxPrice: number; couponDiscount: number;
  isPaid: boolean; paidAt?: string; isDelivered: boolean; deliveredAt?: string;
  expectedDelivery?: string; trackingNumber?: string; carrier?: string;
  createdAt: string;
  shippingAddress: { fullName: string; street: string; city: string; province: string; postalCode: string; country: string; phone: string };
  items: OrderItem[];
  statusHistory: StatusHistory[];
  user: { name: string; email: string };
}

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Package },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const locale = useLocale();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => get<Order>(`/orders/${id}`),
  });

  const { mutate: cancelOrder, isPending: cancelling } = useMutation({
    mutationFn: () => post(`/orders/${id}/cancel`, {}),
    onSuccess: () => {
      toast({ title: 'Order cancellation requested' });
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: () => toast({ title: 'Failed to cancel order', variant: 'destructive' }),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-lg" />)}
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-600">Order not found</p>
        <Link href={`/${locale}/account/orders`} className="text-artic-link hover:underline mt-4 block">
          Back to orders
        </Link>
      </div>
    );
  }

  const order = data.data;

  const currentStepIndex = STATUS_STEPS.findIndex((s) =>
    ['DELIVERED', 'SHIPPED', 'CONFIRMED', 'PENDING'].slice(
      0,
      ['DELIVERED', 'SHIPPED', 'CONFIRMED', 'PENDING'].indexOf(order.status) + 1
    ).includes(s.key)
  );
  const activeStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const progressIndex = activeStepIndex >= 0 ? activeStepIndex : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href={`/${locale}/account`} className="hover:text-artic-link">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/${locale}/account/orders`} className="hover:text-artic-link">Orders</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-800">{order.orderNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          {['PENDING', 'CONFIRMED'].includes(order.status) && (
            <Button
              variant="outline"
              size="sm"
              disabled={cancelling}
              onClick={() => {
                if (confirm('Are you sure you want to cancel this order?')) cancelOrder();
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Status tracker */}
          {!['CANCELLED', 'REFUNDED', 'RETURN_REQUESTED', 'RETURNED'].includes(order.status) && (
            <div className="bg-white border rounded-lg p-5">
              <h2 className="font-semibold mb-5">Delivery Status</h2>
              <div className="relative">
                {/* Progress bar */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
                  <div
                    className="h-full bg-artic-orange transition-all duration-500"
                    style={{ width: `${(progressIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isCompleted = i <= progressIndex;
                    const isCurrent = i === progressIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                            isCompleted
                              ? 'bg-artic-orange border-artic-orange'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${isCompleted ? 'text-black' : 'text-gray-400'}`}
                          />
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-medium ${isCurrent ? 'text-artic-orange' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {isCurrent && order.expectedDelivery && step.key === 'SHIPPED' && (
                            <p className="text-xs text-gray-500">
                              Est. {formatDate(order.expectedDelivery)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.trackingNumber && (
                <div className="mt-4 pt-4 border-t flex items-center gap-3 text-sm">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span>Tracking: <strong>{order.trackingNumber}</strong></span>
                  {order.carrier && <span className="text-gray-500">via {order.carrier}</span>}
                </div>
              )}
            </div>
          )}

          {/* Cancelled / Refunded */}
          {['CANCELLED', 'REFUNDED'].includes(order.status) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-700">Order {order.status.toLowerCase()}</p>
                {order.status === 'REFUNDED' && (
                  <p className="text-sm text-red-600">Refund of {formatPrice(order.totalPrice)} has been processed.</p>
                )}
              </div>
            </div>
          )}

          {/* Order items */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50">
              <h2 className="font-semibold">Items in this order</h2>
            </div>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="p-5 flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 border rounded-lg flex-shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/product/${item.product.slug}`}
                      className="font-medium hover:text-artic-link line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.variantInfo && Object.entries(item.variantInfo).length > 0 && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {Object.entries(item.variantInfo).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Status history */}
          {order.statusHistory.length > 0 && (
            <div className="bg-white border rounded-lg p-5">
              <h2 className="font-semibold mb-4">Order Timeline</h2>
              <ol className="relative border-l border-gray-200 ml-2 space-y-4">
                {order.statusHistory.map((h, i) => (
                  <li key={i} className="ml-4">
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-artic-orange border-2 border-white" />
                    <div className="flex items-baseline justify-between">
                      <p className="font-medium text-sm">
                        {h.status.replace(/_/g, ' ')}
                      </p>
                      <time className="text-xs text-gray-400">{formatDate(h.createdAt)}</time>
                    </div>
                    {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right: summary */}
        <div className="space-y-4">
          {/* Order summary */}
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{formatPrice(order.itemsPrice)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{order.shippingPrice === 0 ? <span className="text-green-700">FREE</span> : formatPrice(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatPrice(order.taxPrice)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-lg">{formatPrice(order.totalPrice)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm pt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.isPaid ? '✓ Paid' : 'Payment Pending'}
              </span>
              {order.paidAt && <span className="text-gray-500 text-xs">{formatDate(order.paidAt)}</span>}
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" /> Shipping Address
            </h2>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-gray-500">{order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" /> Payment
            </h2>
            <p className="text-sm text-gray-700">
              {order.paymentMethod === 'STRIPE' && '💳 Credit / Debit Card'}
              {order.paymentMethod === 'PAYPAL' && '🅿️ PayPal'}
              {order.paymentMethod === 'CASH_ON_DELIVERY' && '💵 Cash on Delivery'}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getOrderStatusColor(order.paymentStatus)}`}>
              {order.paymentStatus}
            </span>
          </div>

          {/* Re-order */}
          {order.status === 'DELIVERED' && (
            <Button
              asChild
              className="w-full bg-artic-orange hover:bg-artic-orange-dark text-black rounded-full"
            >
              <Link href={`/${locale}/search`}>Buy Again</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
