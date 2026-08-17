'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { post } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        setStatus('error');
        setMessage(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Verification failed. The link may have expired.'
        );
      });
  }, [token]);

  return (
    <div className="w-full max-w-sm bg-white border rounded-lg p-8 text-center space-y-4">
      {status === 'loading' && (
        <>
          <Loader2 className="h-14 w-14 text-artic-teal animate-spin mx-auto" />
          <h2 className="text-xl font-semibold">Verifying your email…</h2>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
          <h2 className="text-xl font-semibold">Email verified!</h2>
          <p className="text-gray-600 text-sm">
            Your email has been verified. You can now sign in to your account.
          </p>
          <Button
            onClick={() => router.push(`/${locale}/sign-in`)}
            className="w-full bg-artic-teal hover:bg-artic-teal-dark text-black rounded-full"
          >
            Sign In
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="h-14 w-14 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">Verification failed</h2>
          <p className="text-gray-600 text-sm">{message}</p>
          <a
            href={`/${locale}/sign-in`}
            className="text-artic-link hover:underline text-sm block"
          >
            Back to Sign In
          </a>
        </>
      )}
    </div>
  );
}
