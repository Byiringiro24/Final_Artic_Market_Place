'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Props {
  href: string;
  label: string;
}

export default function FooterLocalLink({ href, label }: Props) {
  const locale = useLocale();
  return (
    <Link href={`/${locale}${href}`} className="hover:text-white transition-colors">
      {label}
    </Link>
  );
}
