'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';
import { post } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

function StripeCheckoutForm({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError('');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setIsLoading(false);
      return;
    }

    // Create payment intent on backend
    try {
      const res = await post<{ clientSecret: string }>('/payments/create-intent', {
        orderId,
        amount,
      });

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: res.data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/${locale}/account/orders/${orderId}?payment=success`,
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed. Please try again.');
      }
    } catch {
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border rounded-lg p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-green-600" />
          Secure Payment
        </h2>
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-artic-teal hover:bg-artic-teal-dark text-black font-bold rounded-full h-12 text-base"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          `Pay ${formatPrice(amount / 100)}`
        )}
      </Button>

      <p className="text-xs text-center text-gray-400">
        🔒 Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}

export default function StripePaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const amountStr = searchParams.get('amount') || '0';
  const amount = parseInt(amountStr);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    post<{ clientSecret: string }>('/payments/create-intent', {
      orderId,
      amount,
    })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId, amount]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invalid payment session.</p>
      </div>
    );
  }

  if (loading || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-artic-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-artic-light-bg py-10">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="text-xl font-black text-artic-teal mb-1">ARTIC</div>
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-gray-500 text-sm mt-1">Order #{orderId.slice(-8).toUpperCase()}</p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#FF9900',
                borderRadius: '8px',
              },
            },
          }}
        >
          <StripeCheckoutForm orderId={orderId} amount={amount} />
        </Elements>
      </div>
    </div>
  );
}
