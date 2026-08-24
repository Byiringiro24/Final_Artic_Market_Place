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
  { code: 'en-US', label: 'English',     flag: '🇺🇸', nativeName: 'English'     },
  { code: 'fr',    label: 'Français',    flag: '🇫🇷', nativeName: 'Français'    },
  { code: 'rw',    label: 'Kinyarwanda', flag: '🇷🇼', nativeName: 'Kinyarwanda' },
  { code: 'sw',    label: 'Kiswahili',   flag: '🇹🇿', nativeName: 'Kiswahili'   },
  { code: 'ar',    label: 'العربية',     flag: '🇸🇦', nativeName: 'العربية'     },
];

export default function LanguageSwitcher() {
  const locale   = useLocale();
  const router   = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const segments  = pathname.split('/');
    segments[1]     = newLocale;
    router.push(segments.join('/'));
  }

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 text-white hover:text-artic-teal transition-colors text-xs px-2 py-1 rounded"
          aria-label="Switch language"
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{current.flag} {current.nativeName.split(' ')[0]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => switchLocale(l.code)}
            className={locale === l.code ? 'bg-muted font-semibold' : ''}
          >
            <span className="mr-2 text-base">{l.flag}</span>
            <span className="flex-1">{l.nativeName}</span>
            {locale === l.code && <span className="text-artic-teal text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
