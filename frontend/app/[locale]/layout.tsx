import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '@/components/providers';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ARTIC Group Ltd | ARTIC HUB',
    template: '%s | ARTIC HUB',
  },
  description: 'ARTIC HUB — Enterprise Management Platform. A product of ARTIC Group Ltd. Engineering • Technology • Innovation.',
  keywords: ['ecommerce', 'marketplace', 'shopping', 'services', 'Rwanda', 'Africa'],
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://artichub.ddnsgeek.com'),
  applicationName: 'ARTIC HUB',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  authors: [{ name: 'ARTIC Group Ltd' }],
  publisher: 'ARTIC Group Ltd',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ARTIC HUB',
  },
  openGraph: {
    type: 'website',
    siteName: 'ARTIC Group Ltd | ARTIC HUB',
  },
};

export const viewport: Viewport = {
  themeColor: '#18A89A',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en-US' | 'fr' | 'ar' | 'rw' | 'sw')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
