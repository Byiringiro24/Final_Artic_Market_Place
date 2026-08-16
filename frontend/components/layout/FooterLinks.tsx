'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

const COLUMNS = [
  {
    heading: 'Get to Know Us',
    links: [
      { label: 'About ARTIC', href: '/page/about-us' },
      { label: 'Careers', href: '/page/careers' },
      { label: 'Press', href: '/page/press' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    heading: 'Make Money with Us',
    links: [
      { label: 'Sell on ARTIC', href: '/page/sell' },
      { label: 'Affiliate Program', href: '/page/affiliates' },
      { label: 'Advertise', href: '/page/advertise' },
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

export default function FooterLinks() {
  const locale = useLocale();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/10 pb-10">
      {COLUMNS.map((col) => (
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
  );
}
