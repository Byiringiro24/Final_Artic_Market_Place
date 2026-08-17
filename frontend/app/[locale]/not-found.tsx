import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { Home, Search } from 'lucide-react';

export default async function NotFound() {
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-artic-light-bg flex flex-col items-center justify-center px-4 text-center">
      {/* Brand */}
      <div className="text-artic-teal text-4xl font-black mb-6">ARTIC</div>

      {/* 404 illustration text */}
      <h1 className="text-8xl font-black text-gray-200 select-none leading-none">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mt-2 mb-3">Page Not Found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        We couldn&apos;t find the page you were looking for. The page may have been removed, had
        its name changed, or is temporarily unavailable.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 bg-artic-teal hover:bg-artic-teal-dark text-black font-medium px-6 py-3 rounded-full transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
        <Link
          href={`/${locale}/search`}
          className="flex items-center gap-2 border border-gray-300 hover:bg-white text-gray-700 font-medium px-6 py-3 rounded-full transition-colors"
        >
          <Search className="h-4 w-4" /> Search Products
        </Link>
      </div>

      {/* Help links */}
      <div className="mt-10 flex gap-5 text-sm text-artic-link">
        <Link href={`/${locale}/page/faq`} className="hover:underline">Help Center</Link>
        <Link href={`/${locale}/page/about-us`} className="hover:underline">About Us</Link>
        <Link href={`/${locale}/page/terms-of-service`} className="hover:underline">Terms</Link>
      </div>
    </div>
  );
}
