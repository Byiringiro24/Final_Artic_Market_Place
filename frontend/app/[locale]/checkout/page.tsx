'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2, CheckCircle2, MapPin, CreditCard, Package,
  Upload, ImagePlus, X, Smartphone, Copy, Check,
} from 'lucide-react';
import { get, post, api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { usePrice } from '@/hooks/usePrice';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type Step = 'address' | 'payment' | 'review' | 'momo-proof';

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

// MTN MoMo numbers for Rwanda
const MOMO_NUMBERS = [
  { label: 'MTN MoMo Code', value: '*182*8*1*593148#', type: 'code' },
  { label: 'Phone Number', value: '0787585826', type: 'phone' },
];

const PAYMENT_METHODS = [
  { id: 'MTN_MOMO',          label: 'MTN MoMo',            icon: '📱', description: 'Pay via MTN Mobile Money' },
  { id: 'STRIPE',            label: 'Credit / Debit Card',  icon: '💳', description: null },
  { id: 'PAYPAL',            label: 'PayPal',               icon: '🅿️', description: null },
  { id: 'CASH_ON_DELIVERY',  label: 'Cash on Delivery',     icon: '💵', description: 'Pay when your order arrives' },
];

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const fmt = usePrice();
  const proofInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('MTN_MOMO');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>('');
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [copied, setCopied] = useState<string>('');

  const subtotal = getSubtotal();
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = (subtotal - couponDiscount) * 0.18;
  const total = subtotal - couponDiscount + shipping + tax;

  const { data: addressData } = useQuery({
    queryKey: queryKeys.users.addresses,
    queryFn: () => get<Address[]>('/users/addresses'),
    enabled: isAuthenticated,
  });

  const addresses = (addressData?.data as unknown as Address[]) || [];
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses.find((a) => a.isDefault);

  const form = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  const { mutate: addAddress, isPending: savingAddress } = useMutation({
    mutationFn: (d: AddressForm) => post<Address>('/users/addresses', d),
    onSuccess: (res) => {
      setSelectedAddressId((res.data as unknown as Address).id);
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
      const order = (res as any).data;
      if (paymentMethod === 'MTN_MOMO') {
        setPlacedOrderId(order.id);
        setPlacedOrderNumber(order.orderNumber);
        setStep('momo-proof');
      } else {
        router.push(`/${locale}/account/orders/${order.id}`);
      }
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
      const { value, type, maxDiscountAmount } = res.data as unknown as { value: number; type: string; maxDiscountAmount?: number };
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

  function handleProofSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submitProof() {
    if (!proofFile || !placedOrderId) return;
    setUploadingProof(true);
    try {
      const fd = new FormData();
      fd.append('proof', proofFile);
      await api.post(`/orders/${placedOrderId}/payment-proof`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProofSubmitted(true);
      toast({ title: '✅ Proof submitted! Admin will verify your payment.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed';
      toast({ title: 'Failed to submit proof', description: msg, variant: 'destructive' });
    } finally {
      setUploadingProof(false);
    }
  }

  function copyToClipboard(value: string, id: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  if (!isAuthenticated) {
    router.push(`/${locale}/sign-in?redirect=/${locale}/checkout`);
    return null;
  }

  if (items.length === 0 && step !== 'momo-proof') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => router.push(`/${locale}`)} className="bg-artic-teal text-black rounded-full">
          Continue Shopping
        </Button>
      </div>
    );
  }

  const steps = [
    { id: 'address' as Step, label: 'Address',  icon: <MapPin className="h-4 w-4" /> },
    { id: 'payment' as Step, label: 'Payment',  icon: <CreditCard className="h-4 w-4" /> },
    { id: 'review'  as Step, label: 'Review',   icon: <Package className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-artic-light-bg">
      <header className="bg-white border-b py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold text-artic-teal">ARTIC</div>
          <h1 className="text-lg font-medium">Checkout</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 grid md:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">

          {/* ── MoMo proof upload screen ─────────────────────────────── */}
          {step === 'momo-proof' && (
            <div className="bg-white rounded-lg border p-6 space-y-5">
              {proofSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-artic-teal mx-auto" />
                  <h2 className="text-2xl font-bold">Proof Submitted!</h2>
                  <p className="text-gray-500">Your payment proof for <strong>{placedOrderNumber}</strong> has been sent to the admin for verification.</p>
                  <p className="text-sm text-gray-400">You&apos;ll receive an email once your payment is confirmed.</p>
                  <Button
                    onClick={() => router.push(`/${locale}/account/orders/${placedOrderId}`)}
                    className="bg-artic-teal text-black rounded-full mt-2"
                  >
                    Track My Order
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Complete Your MoMo Payment</h2>
                      <p className="text-sm text-gray-500">Order <span className="font-semibold text-artic-teal">{placedOrderNumber}</span> — {fmt(total)}</p>
                    </div>
                  </div>

                  {/* MoMo payment instructions */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 space-y-4">
                    <p className="font-semibold text-sm text-gray-800">Send exactly <span className="text-artic-teal font-bold text-lg">{fmt(total)}</span> to:</p>

                    {MOMO_NUMBERS.map((n) => (
                      <div key={n.label} className="flex items-center justify-between bg-white border rounded-lg px-4 py-3">
                        <div>
                          <p className="text-xs text-gray-500">{n.label}</p>
                          <p className="font-mono font-bold text-lg tracking-wide">{n.value}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(n.value, n.label)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          aria-label={`Copy ${n.label}`}
                        >
                          {copied === n.label
                            ? <Check className="h-4 w-4 text-green-600" />
                            : <Copy className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    ))}

                    <div className="text-xs text-gray-500 space-y-1 pt-1">
                      <p>1. Dial <strong>*182*8*1*593148#</strong> or go to MTN MoMo app</p>
                      <p>2. Enter amount: <strong>{fmt(total)}</strong></p>
                      <p>3. Use reference: <strong>{placedOrderNumber}</strong></p>
                      <p>4. Complete the payment and take a screenshot</p>
                    </div>
                  </div>

                  {/* Proof upload */}
                  <div className="space-y-3">
                    <p className="font-semibold text-sm">Upload your payment screenshot</p>
                    <p className="text-xs text-gray-500">After completing the payment, take a screenshot and upload it here as proof.</p>

                    {proofPreview ? (
                      <div className="relative rounded-xl overflow-hidden border max-h-80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={proofPreview} alt="Payment proof" className="w-full object-contain max-h-80" />
                        <button
                          onClick={() => { setProofFile(null); setProofPreview(''); }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full"
                          aria-label="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => proofInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-artic-teal hover:bg-artic-teal/5 transition-colors"
                      >
                        <ImagePlus className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-600">Click to upload screenshot</p>
                        <p className="text-xs text-gray-400 mt-1">JPEG, PNG or WebP · Max 10MB</p>
                      </div>
                    )}

                    <input
                      ref={proofInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleProofSelect}
                      aria-label="Select payment proof image"
                    />

                    <Button
                      onClick={submitProof}
                      disabled={!proofFile || uploadingProof}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full h-12 gap-2"
                    >
                      {uploadingProof
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                        : <><Upload className="h-4 w-4" /> Submit Payment Proof</>}
                    </Button>

                    <button
                      onClick={() => router.push(`/${locale}/account/orders/${placedOrderId}`)}
                      className="w-full text-sm text-gray-400 hover:text-gray-600 text-center py-1"
                    >
                      Submit later from My Orders
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Step indicators (hidden on proof screen) ──────────────── */}
          {step !== 'momo-proof' && (
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
          )}

          {/* ── Step: Address ─────────────────────────────────────────── */}
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
                          ? 'border-artic-teal bg-orange-50' : 'hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio" name="address" value={addr.id}
                        checked={(selectedAddressId || addresses.find((a) => a.isDefault)?.id) === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1"
                      />
                      <div className="text-sm">
                        <p className="font-medium">{addr.fullName} {addr.isDefault && <span className="text-artic-teal text-xs ml-1">Default</span>}</p>
                        <p className="text-gray-600">{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
                        <p className="text-gray-600">{addr.country} · {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                  <button onClick={() => setAddingAddress(true)} className="text-artic-link hover:underline text-sm">+ Add a new address</button>
                </div>
              )}

              {(addresses.length === 0 || addingAddress) && (
                <form onSubmit={form.handleSubmit((d) => addAddress(d))} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Full name</Label><Input className="mt-1" {...form.register('fullName')} /></div>
                    <div><Label>Phone</Label><Input className="mt-1" {...form.register('phone')} /></div>
                  </div>
                  <div><Label>Street address</Label><Input className="mt-1" {...form.register('street')} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>City</Label><Input className="mt-1" {...form.register('city')} /></div>
                    <div><Label>State / Province</Label><Input className="mt-1" {...form.register('province')} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Postal code</Label><Input className="mt-1" {...form.register('postalCode')} /></div>
                    <div><Label>Country</Label><Input className="mt-1" {...form.register('country')} placeholder="RW" /></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={savingAddress} className="bg-artic-teal text-black rounded-full">
                      {savingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Use this address'}
                    </Button>
                    {addresses.length > 0 && <Button type="button" variant="outline" onClick={() => setAddingAddress(false)} className="rounded-full">Cancel</Button>}
                  </div>
                </form>
              )}

              {addresses.length > 0 && !addingAddress && (
                <Button
                  onClick={() => { setSelectedAddressId(selectedAddressId || addresses.find((a) => a.isDefault)?.id || addresses[0].id); setStep('payment'); }}
                  className="bg-artic-teal text-black rounded-full"
                >
                  Continue to payment
                </Button>
              )}
            </div>
          )}

          {/* ── Step: Payment ─────────────────────────────────────────── */}
          {step === 'payment' && (
            <div className="bg-white rounded-lg border p-5 space-y-4">
              <h2 className="font-semibold text-lg">Select a payment method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === pm.id ? 'border-artic-teal bg-orange-50' : 'hover:border-gray-400'
                    }`}
                  >
                    <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="mt-0.5" />
                    <span className="text-xl">{pm.icon}</span>
                    <div>
                      <span className="text-sm font-medium">{pm.label}</span>
                      {pm.description && <p className="text-xs text-gray-400">{pm.description}</p>}
                      {pm.id === 'MTN_MOMO' && paymentMethod === 'MTN_MOMO' && (
                        <div className="mt-2 space-y-1.5">
                          {MOMO_NUMBERS.map((n) => (
                            <div key={n.label} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
                              <span className="text-xs text-gray-500 w-24 flex-shrink-0">{n.label}:</span>
                              <span className="font-mono font-bold text-sm flex-1">{n.value}</span>
                              <button type="button" onClick={() => copyToClipboard(n.value, n.label)} className="text-gray-400 hover:text-artic-teal" aria-label="Copy">
                                {copied === n.label ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          ))}
                          <p className="text-xs text-yellow-700 bg-yellow-50 rounded p-2">
                            After placing your order you&apos;ll be asked to upload a screenshot of your payment.
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Coupon */}
              <div>
                <Label>Promo / Coupon code</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" className="uppercase" />
                  <Button onClick={applyCoupon} disabled={couponLoading} variant="outline" className="rounded-full shrink-0">
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
                {couponDiscount > 0 && <p className="text-green-700 text-sm mt-1">✓ Saving {fmt(couponDiscount)}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep('review')} className="bg-artic-teal text-black rounded-full">Review your order</Button>
                <Button variant="outline" onClick={() => setStep('address')} className="rounded-full">Back</Button>
              </div>
            </div>
          )}

          {/* ── Step: Review ──────────────────────────────────────────── */}
          {step === 'review' && (
            <div className="bg-white rounded-lg border p-5 space-y-4">
              <h2 className="font-semibold text-lg">Review your order</h2>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Delivering to {selectedAddress?.fullName}</p>
                  <p className="text-gray-600">{selectedAddress?.street}, {selectedAddress?.city}</p>
                </div>
                <button onClick={() => setStep('address')} className="ml-auto text-artic-link text-xs hover:underline">Change</button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.icon} {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}</p>
                  {paymentMethod === 'MTN_MOMO' && <p className="text-xs text-yellow-700">You&apos;ll upload payment proof after placing the order</p>}
                </div>
                <button onClick={() => setStep('payment')} className="ml-auto text-artic-link text-xs hover:underline">Change</button>
              </div>

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
                className={`w-full font-bold rounded-full h-12 ${paymentMethod === 'MTN_MOMO' ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-artic-teal hover:bg-artic-teal-dark text-black'}`}
              >
                {placing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {paymentMethod === 'MTN_MOMO' ? '📱 Place Order & Pay via MoMo' : `Place Order · ${fmt(total)}`}
              </Button>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        {step !== 'momo-proof' && (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4 space-y-3">
              <h2 className="font-semibold">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Items ({items.reduce((s, i) => s + i.quantity, 0)}):</span><span>{fmt(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping:</span><span className={shipping === 0 ? 'text-green-700' : ''}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-green-700"><span>Coupon discount:</span><span>-{fmt(couponDiscount)}</span></div>}
                <div className="flex justify-between"><span>Estimated tax (18%):</span><span>{fmt(tax)}</span></div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg"><span>Order Total:</span><span className="text-red-700">{fmt(total)}</span></div>
              {step === 'review' && (
                <Button
                  onClick={() => placeOrder()}
                  disabled={placing}
                  className={`w-full rounded-full font-bold ${paymentMethod === 'MTN_MOMO' ? 'bg-yellow-400 text-black' : 'bg-artic-teal text-black'}`}
                >
                  {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Place Order'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
