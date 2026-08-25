'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { initCurrencyRates, useCurrencyStore } from '@/store/currency.store';
import { useAuthStore } from '@/store/auth.store';
import type { CurrencyCode } from '@/lib/currency';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      })
  );

  const pathname  = usePathname();
  const router    = useRouter();
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const { user, isAuthenticated } = useAuthStore();

  // Track the last user id we applied preferences for — avoid re-running on unrelated re-renders
  const appliedForUser = useRef<string | null>(null);

  // ── 1. Fetch live exchange rates once on app start ────────────────────────
  useEffect(() => {
    initCurrencyRates();
  }, []);

  // ── 2. Apply user preferences (currency + language) on login / hydration ──
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (appliedForUser.current === user.id) return; // already applied
    appliedForUser.current = user.id;

    // Apply saved currency
    if (user.preferredCurrency) {
      setCurrency(user.preferredCurrency as CurrencyCode);
    }

    // Apply saved language — only redirect if locale in URL differs
    if (user.preferredLanguage) {
      const segments = pathname.split('/');
      const currentLocale = segments[1];
      if (currentLocale !== user.preferredLanguage) {
        segments[1] = user.preferredLanguage;
        router.replace(segments.join('/'));
      }
    }
  }, [isAuthenticated, user, pathname, router, setCurrency]);

  // ── 3. Reset applied tracker on logout ───────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      appliedForUser.current = null;
    }
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
