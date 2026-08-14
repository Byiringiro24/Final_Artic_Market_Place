import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

export default async function Footer() {
  const locale = await getLocale();
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: 'Get to Know Us',
      links: [
        { label: 'About ARTIC', href: '/page/about-us' },
        { label: 'Careers', href: '/page/careers' },
        { label: 'Press Releases', href: '/page/press' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    {
      heading: 'Make Money with Us',
      links: [
        { label: 'Sell on ARTIC', href: '/page/sell' },
        { label: 'Affiliate Program', href: '/page/affiliates' },
        { label: 'Advertise Your Products', href: '/page/advertise' },
      ],
    },
    {
      heading: 'Payment & Shipping',
      links: [
        { label: 'Payment Methods', href: '/page/payment' },
        { label: 'ARTIC Wallet', href: '/page/wallet' },
        { label: 'Shipping Rates', href: '/page/shipping' },
        { label: 'Returns Policy', href: '/page/returns' },
      ],
    },
    {
      heading: 'Let Us Help You',
      links: [
        { label: 'Your Account', href: '/account' },
        { label: 'Your Orders', href: '/account/orders' },
        { label: 'Shipping & Delivery', href: '/page/shipping' },
        { label: 'Returns & Replacements', href: '/page/returns' },
        { label: 'Help Center', href: '/page/faq' },
      ],
    },
  ];

  const socials = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-artic-navy text-white mt-auto">
      {/* Back to top */}
      <div className="bg-artic-teal hover:bg-artic-teal/80 text-center py-3 cursor-pointer transition-colors">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-sm w-full"
          aria-label="Back to top"
        >
          Back to top
        </button>
      </div>

      {/* Main footer links */}
      <div className="max-w-[1500px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/10 pb-10">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="font-bold text-sm mb-4">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Logo + social + legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="bg-artic-orange rounded px-2 py-1 text-black font-black text-lg">
              ARTIC
            </div>
            <span className="text-white text-sm">marketplace</span>
          </Link>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom legal row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© {year} ARTIC Marketplace. All rights reserved.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href={`/${locale}/page/privacy-policy`} className="hover:text-white transition-colors">Privacy</Link>
            <Link href={`/${locale}/page/terms-of-service`} className="hover:text-white transition-colors">Terms</Link>
            <Link href={`/${locale}/page/faq`} className="hover:text-white transition-colors">FAQ</Link>
            <Link href={`/${locale}/page/about-us`} className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
