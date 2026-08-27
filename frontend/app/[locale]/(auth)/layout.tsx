import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-artic-light-bg flex flex-col">
      {/* Minimal header */}
      <header className="bg-white border-b py-3 px-6 flex justify-center">
        <Link href="/" className="flex items-center" aria-label="ARTIC Group Ltd — Home">
          <Image
            src="/logo.jpg"
            alt="ARTIC Group Ltd"
            width={130}
            height={52}
            className="h-11 w-auto max-w-[130px] object-contain logo-mark"
            priority
          />
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
