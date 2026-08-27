'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Chrome, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GoogleSignInButton({
  label = 'Continue with Google',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || `/${locale}`;
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: redirect, redirect: true });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full justify-center gap-2 rounded-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 ${className}`}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
      {label}
    </Button>
  );
}
