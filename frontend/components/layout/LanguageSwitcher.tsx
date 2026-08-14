'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const locales = [
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    // Replace the current locale prefix in the path
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  }

  const current = locales.find((l) => l.code === locale) || locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 text-white hover:text-artic-orange transition-colors text-xs px-2 py-1"
          aria-label="Switch language"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{current.flag} {current.label.split(' ')[0]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => switchLocale(l.code)}
            className={locale === l.code ? 'bg-muted font-semibold' : ''}
          >
            {l.flag} {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
