'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { get } from '@/lib/api';

interface DiscoveryItem { id: string; name?: string; title?: string; slug: string; summary?: string | null; shortDesc?: string | null; category?: string | { name: string } | null }
interface DiscoveryResponse { products: DiscoveryItem[]; services: DiscoveryItem[]; courses: DiscoveryItem[] }
interface SearchSuggestion extends DiscoveryItem { kind: 'Product' | 'Service' | 'Academy course'; href: string; location: string }

export default function SearchBar() {
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) { setSuggestions([]); setIsOpen(false); return; }
    let active = true;
    setIsLoading(true);
    get<DiscoveryResponse>('/discovery/search', { q: debouncedQuery.trim() })
      .then(({ data }) => {
        if (!active) return;
        const entries: SearchSuggestion[] = [
          ...(data.products ?? []).map((item) => ({ ...item, title: item.title ?? item.name ?? 'Product', summary: item.summary ?? item.shortDesc, kind: 'Product' as const, href: `/${locale}/product/${item.slug}`, location: 'Marketplace' })),
          ...(data.services ?? []).map((item) => ({ ...item, title: item.title ?? item.name ?? 'Service', summary: item.summary ?? item.shortDesc, kind: 'Service' as const, href: `/${locale}/services/${item.slug}`, location: 'Services' })),
          ...(data.courses ?? []).map((item) => ({ ...item, title: item.title ?? item.name ?? 'Course', kind: 'Academy course' as const, href: `/${locale}/academy/training-registration?course=${encodeURIComponent(item.id)}`, location: 'ARTIC Academy · training registration' })),
        ];
        setSuggestions(entries.slice(0, 8)); setIsOpen(true);
      })
      .catch(() => { if (active) { setSuggestions([]); setIsOpen(true); } })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [debouncedQuery, locale]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/${locale}/discover?q=${encodeURIComponent(query.trim())}`);
  }

  function handleSelect(item: SearchSuggestion) {
    setIsOpen(false); setQuery(''); router.push(item.href);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex h-10">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => suggestions.length > 0 && setIsOpen(true)} placeholder="Search products, services, courses, and more…" className="min-w-0 flex-1 rounded-l-md bg-white px-4 py-2 text-sm text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#18A89A]" aria-label="Search all of ARTIC HUB" aria-autocomplete="list" aria-expanded={isOpen} />
        <button type="submit" className="flex items-center rounded-r-md bg-[#0F7A70] px-4 text-white transition-colors hover:bg-[#0B625A]" aria-label="Search all of ARTIC HUB"><Search className="h-5 w-5" /></button>
      </form>
      {isOpen && <div className="absolute left-0 right-0 top-full z-50 max-h-96 overflow-y-auto rounded-b-md border border-slate-200 bg-white text-slate-900 shadow-xl">
        {isLoading ? <div className="p-3 text-sm text-slate-600">Searching across ARTIC HUB…</div> : suggestions.length ? <>
          <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Choose a destination</div>
          <ul role="listbox">{suggestions.map((item) => <li key={`${item.kind}-${item.id}`}><button onClick={() => handleSelect(item)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50" role="option"><span className="min-w-0"><span className="block truncate font-medium text-slate-900">{item.title}</span><span className="block truncate text-xs text-slate-600">{item.summary || item.location}</span></span><span className="shrink-0 text-right"><span className="block rounded-full bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-900">{item.kind}</span><span className="mt-1 block text-[10px] text-slate-500">{item.location}</span></span></button></li>)}</ul>
          <button onClick={() => router.push(`/${locale}/discover?q=${encodeURIComponent(query.trim())}`)} className="w-full border-t border-slate-100 px-4 py-3 text-left text-xs font-semibold text-teal-800 hover:bg-teal-50">See all results across ARTIC HUB →</button>
        </> : <div className="p-3 text-sm text-slate-600">No live products, services, or courses found. Press Enter to search all destinations.</div>}
      </div>}
    </div>
  );
}
