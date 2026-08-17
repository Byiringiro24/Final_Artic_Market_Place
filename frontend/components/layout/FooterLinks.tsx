'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

const COLUMNS = [
  {
    heading: 'ARTIC Marketplace',
    links: [
      { label: 'About Us', href: '/page/about-us' },
      { label: 'Services', href: '/services' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/page/careers' },
    ],
  },
  {
    heading: 'Sell With Us',
    links: [
      { label: 'Sell on ARTIC', href: '/sell' },
      { label: 'Seller Guide', href: '/page/seller-guide' },
      { label: 'Affiliate Program', href: '/page/affiliates' },
      { label: 'Advertise', href: '/page/advertise' },
    ],
  },
  {
    heading: 'Payment & Shipping',
    links: [
      { label: 'Payment Methods', href: '/page/payment' },
      { label: 'Shipping Rates', href: '/page/shipping' },
      { label: 'Returns Policy', href: '/page/returns' },
      { label: 'Track Order', href: '/account/orders' },
    ],
  },
  {
    heading: 'Customer Support',
    links: [
      { label: 'Help Center', href: '/customer-service' },
      { label: 'Your Account', href: '/account' },
      { label: 'Your Orders', href: '/account/orders' },
      { label: 'Contact Us', href: '/customer-service' },
    ],
  },
];

export default function FooterLinks() {
  const locale = useLocale();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/10 pb-10">
      {COLUMNS.map((col) => (
        <div key={col.heading}>
          <h3 className="font-bold text-sm mb-4 text-artic-teal">{col.heading}</h3>
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
