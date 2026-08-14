import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-artic-light-bg flex flex-col">
      {/* Minimal header */}
      <header className="bg-white border-b py-4 px-6 flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-artic-orange rounded px-2 py-1 text-black font-black text-xl">ARTIC</div>
          <span className="text-gray-600 text-sm">marketplace</span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center pt-8 px-4">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-gray-500 border-t bg-white">
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/page/terms-of-service" className="hover:underline">Terms</Link>
          <Link href="/page/privacy-policy" className="hover:underline">Privacy</Link>
          <Link href="/page/faq" className="hover:underline">Help</Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} ARTIC Marketplace</p>
      </footer>
    </div>
  );
}
