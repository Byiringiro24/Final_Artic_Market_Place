import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import BackToTop from './BackToTop';
import FooterLinks from './FooterLinks';
import FooterLocalLink from './FooterLocalLink';

const LEGAL_LINKS = [
  { href: '/page/privacy-policy', label: 'Privacy' },
  { href: '/page/terms-of-service', label: 'Terms' },
  { href: '/page/faq', label: 'FAQ' },
  { href: '/page/about-us', label: 'About' },
];

const SOCIALS = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-artic-navy text-white mt-auto">
      {/* Back to top button — client component (needs onClick) */}
      <BackToTop />

      <div className="max-w-[1500px] mx-auto px-6 py-10">
        {/* Column links — client component (needs useLocale) */}
        <FooterLinks />

        {/* Logo + social */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-artic-orange rounded px-2 py-1 text-black font-black text-lg">
              ARTIC
            </div>
            <span className="text-white text-sm">marketplace</span>
          </div>

          <div className="flex items-center gap-4">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
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

        {/* Legal row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© {year} ARTIC Marketplace. All rights reserved.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            {LEGAL_LINKS.map((l) => (
              <FooterLocalLink key={l.href} href={l.href} label={l.label} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
