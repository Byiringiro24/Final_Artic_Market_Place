import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '@/components/providers';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'ARTIC Marketplace',
    template: '%s | ARTIC Marketplace',
  },
  description: 'Your one-stop marketplace for products and professional services — ARTIC',
  keywords: ['ecommerce', 'marketplace', 'shopping', 'services', 'Rwanda', 'Africa'],
  manifest: '/manifest.json',
  themeColor: '#18A89A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ARTIC Marketplace',
  },
  openGraph: {
    type: 'website',
    siteName: 'ARTIC Marketplace',
  },
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

  if (!routing.locales.includes(locale as 'en-US' | 'fr' | 'ar')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
