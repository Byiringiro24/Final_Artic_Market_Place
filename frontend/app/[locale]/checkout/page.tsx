'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2, MapPin, CreditCard, Package } from 'lucide-react';
import { get, post } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { usePrice } from '@/hooks/usePrice';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type Step = 'address' | 'payment' | 'review';

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  street: z.string().min(3),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
});
type AddressForm = z.infer<typeof addressSchema>;

interface Address extends AddressForm { id: string; isDefault: boolean; label?: string }

const PAYMENT_METHODS = [
  { id: 'STRIPE', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'PAYPAL', label: 'PayPal', icon: '🅿️' },
  { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: '💵' },
];

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const fmt = usePrice();

  const [step, setStep] = useState<Step>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('STRIPE');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);

  const subtotal = getSubtotal();
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = (subtotal - couponDiscount) * 0.18;
  const total = subtotal - couponDiscount + shipping + tax;

  const { data: addressData } = useQuery({
    queryKey: queryKeys.users.addresses,
    queryFn: () => get<Address[]>('/users/addresses'),
    enabled: isAuthenticated,
  });

  const addresses = addressData?.data || [];
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses.find((a) => a.isDefault);

  const form = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  const { mutate: addAddress, isPending: savingAddress } = useMutation({
    mutationFn: (d: AddressForm) => post<Address>('/users/addresses', d),
    onSuccess: (res) => {
      setSelectedAddressId(res.data.id);
      setAddingAddress(false);
      setStep('payment');
    },
  });

  const { mutate: placeOrder, isPending: placing } = useMutation({
    mutationFn: () =>
      post('/orders', {
        shippingAddressId: selectedAddress?.id || selectedAddressId,
        paymentMethod,
        couponCode: couponCode || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variantInfo: i.variantInfo,
        })),
      }),
    onSuccess: (res) => {
      clearCart();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/${locale}/account/orders/${(res as any).data.id}`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to place order';
      toast({ title: 'Order failed', description: msg, variant: 'destructive' });
    },
  });

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await post<{ value: number; type: string; maxDiscountAmount?: number }>(
        '/promotions/validate', { code: couponCode, orderAmount: subtotal }
      );
      const { value, type, maxDiscountAmount } = res.data;
      let discount = 0;
      if (type === 'PERCENTAGE') {
        discount = (subtotal * Number(value)) / 100;
        if (maxDiscountAmount) discount = Math.min(discount, Number(maxDiscountAmount));
      } else if (type === 'FIXED_AMOUNT') {
        discount = Math.min(Number(value), subtotal);
      } else if (type === 'FREE_SHIPPING') {
        discount = shipping;
      }
      setCouponDiscount(discount);
      toast({ title: `Coupon applied! You saved ${fmt(discount)}` });
    } catch {
      toast({ title: 'Invalid coupon', variant: 'destructive' });
    } finally {
      setCouponLoading(false);
    }
  }

  if (!isAuthenticated) {
    router.push(`/${locale}/sign-in?redirect=/${locale}/checkout`);
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => router.push(`/${locale}`)} className="bg-artic-teal text-black rounded-full">
          Continue Shopping
        </Button>
      </div>
    );
  }

  const steps: Array<{ id: Step; label: string; icon: React.ReactNode }> = [
    { id: 'address', label: 'Address', icon: <MapPin className="h-4 w-4" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'review', label: 'Review', icon: <Package className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-artic-light-bg">
      {/* Checkout header */}
      <header className="bg-white border-b py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold text-artic-teal">ARTIC</div>
          <h1 className="text-lg font-medium">Checkout</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 grid md:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  step === s.id ? 'bg-artic-teal text-black' : 'bg-white border text-gray-400'
                }`}>
                  {s.icon} {s.label}
                </div>
                {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300" />}
              </div>
            ))}
          </div>

          {/* Step: Address */}
          {step === 'address' && (
            <div className="bg-white rounded-lg border p-5 space-y-4">
              <h2 className="font-semibold text-lg">Select a delivery address</h2>

              {addresses.length > 0 && !addingAddress && (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        (selectedAddressId || (addr.isDefault ? addr.id : '')) === addr.id
                          ? 'border-artic-teal bg-orange-50'
                          : 'hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={(selectedAddressId || addresses.find((a) => a.isDefault)?.id) === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1"
                      />
                      <div className="text-sm">
                        <p className="font-medium">{addr.fullName} {addr.isDefault && <span className="text-artic-teal text-xs ml-1">Default</span>}</p>
                        <p className="text-gray-600">{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
                        <p className="text-gray-600">{addr.country}</p>
                        <p className="text-gray-600">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                  <button onClick={() => setAddingAddress(true)} className="text-artic-link hover:underline text-sm">
                    + Add a new address
                  </button>
                </div>
              )}

              {(addresses.length === 0 || addingAddress) && (
                <form onSubmit={form.handleSubmit((d) => addAddress(d))} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Full name</Label>
                      <Input className="mt-1" {...form.register('fullName')} />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input className="mt-1" {...form.register('phone')} />
                    </div>
                  </div>
                  <div>
                    <Label>Street address</Label>
                    <Input className="mt-1" {...form.register('street')} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>City</Label>
                      <Input className="mt-1" {...form.register('city')} />
                    </div>
                    <div>
                      <Label>State / Province</Label>
                      <Input className="mt-1" {...form.register('province')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Postal code</Label>
                      <Input className="mt-1" {...form.register('postalCode')} />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input className="mt-1" {...form.register('country')} placeholder="US" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={savingAddress} className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-full">
                      {savingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Use this address'}
                    </Button>
                    {addresses.length > 0 && (
                      <Button type="button" variant="outline" onClick={() => setAddingAddress(false)} className="rounded-full">Cancel</Button>
                    )}
                  </div>
                </form>
              )}

              {addresses.length > 0 && !addingAddress && (
                <Button
                  onClick={() => { setSelectedAddressId(selectedAddressId || addresses.find((a) => a.isDefault)?.id || addresses[0].id); setStep('payment'); }}
                  className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-full"
                >
                  Continue to payment
                </Button>
              )}
            </div>
          )}

          {/* Step: Payment */}
          {step === 'payment' && (
            <div className="bg-white rounded-lg border p-5 space-y-4">
              <h2 className="font-semibold text-lg">Select a payment method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === pm.id ? 'border-artic-teal bg-orange-50' : 'hover:border-gray-400'
                    }`}
                  >
                    <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} />
                    <span className="text-xl">{pm.icon}</span>
                    <span className="text-sm font-medium">{pm.label}</span>
                  </label>
                ))}
              </div>

              {/* Coupon */}
              <div>
                <Label>Promo / Coupon code</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="uppercase"
                  />
                  <Button onClick={applyCoupon} disabled={couponLoading} variant="outline" className="rounded-full shrink-0">
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
                {couponDiscount > 0 && (
                  <p className="text-green-700 text-sm mt-1">✓ Saving {fmt(couponDiscount)}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep('review')} className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-full">
                  Review your order
                </Button>
                <Button variant="outline" onClick={() => setStep('address')} className="rounded-full">Back</Button>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === 'review' && (
            <div className="bg-white rounded-lg border p-5 space-y-4">
              <h2 className="font-semibold text-lg">Review your order</h2>

              {/* Address summary */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Delivering to {selectedAddress?.fullName}</p>
                  <p className="text-gray-600">{selectedAddress?.street}, {selectedAddress?.city}</p>
                </div>
                <button onClick={() => setStep('address')} className="ml-auto text-artic-link text-xs hover:underline">Change</button>
              </div>

              {/* Payment summary */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <p className="text-sm font-medium">{PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}</p>
                <button onClick={() => setStep('payment')} className="ml-auto text-artic-link text-xs hover:underline">Change</button>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 text-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded border flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image || '/images/placeholder.jpg'} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{fmt(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <Button
                onClick={() => placeOrder()}
                disabled={placing}
                className="w-full bg-artic-teal hover:bg-artic-teal-dark text-black font-bold rounded-full h-12"
              >
                {placing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Place Order · {fmt(total)}
              </Button>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items ({items.reduce((s, i) => s + i.quantity, 0)}):</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className={shipping === 0 ? 'text-green-700' : ''}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Coupon discount:</span>
                  <span>-{fmt(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated tax (18%):</span>
                <span>{fmt(tax)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Order Total:</span>
              <span className="text-red-700">{fmt(total)}</span>
            </div>

            {step === 'review' && (
              <Button
                onClick={() => placeOrder()}
                disabled={placing}
                className="w-full bg-artic-teal hover:bg-artic-teal-dark text-black rounded-full font-bold"
              >
                {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : `Place Order`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
