'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowUpRight, BookOpen, BriefcaseBusiness, ExternalLink, Search, ShoppingBag, Wrench } from 'lucide-react';
import { get } from '@/lib/api';

type Kind = 'Product' | 'Service' | 'Academy course' | 'ARTIC HUB page';
type Item = { id: string; title: string; slug?: string; summary?: string | null; category?: string | { name: string } | null; kind: Kind; location: string; href: string; external?: boolean; keywords: string };
type ApiItem = { id: string; name?: string; title?: string; slug: string; shortDesc?: string | null; summary?: string | null; category?: string | { name: string } | null };
type SearchData = { products: ApiItem[]; services: ApiItem[]; courses: ApiItem[] };

const destinations = [
  { title: 'Marketplace', summary: 'Browse the product catalog and deals.', path: '/search', keywords: 'marketplace shop buy products catalog deals' },
  { title: 'ARTIC Academy', summary: 'Explore available courses and learning programmes.', path: '/academy', keywords: 'academy learning course training education study' },
  { title: 'Training registration', summary: 'Register interest in individual or team training.', path: '/academy/training-registration', keywords: 'register training team course class' },
  { title: 'Professional services', summary: 'Explore services and request a booking or consultation.', path: '/services', keywords: 'service booking consultant repair engineering technology' },
  { title: 'Become a seller', summary: 'Apply to list products in the ARTIC marketplace.', path: '/sell', keywords: 'seller provider vendor sell partner' },
  { title: 'Customer support', summary: 'Get help with orders, services, and your ARTIC account.', path: '/customer-service', keywords: 'help support contact order customer care' },
  { title: 'ARTIC VMS', summary: 'Open the separate vehicle monitoring system.', path: 'https://articvms.ddnsgeek.com', external: true, keywords: 'vms vehicle fleet tracking monitoring register login' },
];

const filters = ['All', 'Products', 'Services', 'Courses', 'Pages'] as const;
type Filter = typeof filters[number];

export default function DiscoveryPage({ initialQuery }: { initialQuery: string }) {
  const locale = useLocale();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>('All');
  const [live, setLive] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setLive([]); setLoading(false); return; }
    let active = true;
    setLoading(true); setError(false);
    get<SearchData>('/discovery/search', { q: term })
      .then(({ data }) => {
        if (!active) return;
        const items: Item[] = [
          ...(data.products ?? []).map((x) => ({ id: x.id, title: x.name ?? x.title ?? 'Product', slug: x.slug, summary: x.shortDesc, category: x.category, kind: 'Product' as const, location: 'Marketplace', href: `/${locale}/product/${x.slug}`, keywords: '' })),
          ...(data.services ?? []).map((x) => ({ id: x.id, title: x.title ?? x.name ?? 'Service', slug: x.slug, summary: x.shortDesc, category: x.category, kind: 'Service' as const, location: 'Services', href: `/${locale}/services/${x.slug}`, keywords: '' })),
          ...(data.courses ?? []).map((x) => ({ id: x.id, title: x.title ?? x.name ?? 'Course', slug: x.slug, summary: x.summary, category: x.category, kind: 'Academy course' as const, location: 'ARTIC Academy · training registration', href: `/${locale}/academy/training-registration?course=${encodeURIComponent(x.id)}`, keywords: '' })),
        ];
        setLive(items);
      })
      .catch(() => { if (active) { setLive([]); setError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, locale]);

  const pageItems = useMemo<Item[]>(() => destinations.filter((x) => `${x.title} ${x.summary} ${x.keywords}`.toLowerCase().includes(query.trim().toLowerCase())).map((x) => ({
    id: x.title, title: x.title, summary: x.summary, kind: 'ARTIC HUB page' as const, location: 'ARTIC HUB', href: x.external ? x.path : `/${locale}${x.path}`, external: x.external, keywords: x.keywords,
  })), [query, locale]);

  const allItems = [...live, ...pageItems];
  const selectedItems = allItems.filter((x) => filter === 'All' || (filter === 'Products' && x.kind === 'Product') || (filter === 'Services' && x.kind === 'Service') || (filter === 'Courses' && x.kind === 'Academy course') || (filter === 'Pages' && x.kind === 'ARTIC HUB page'));
  const counts: Record<Filter, number> = { All: allItems.length, Products: live.filter((x) => x.kind === 'Product').length, Services: live.filter((x) => x.kind === 'Service').length, Courses: live.filter((x) => x.kind === 'Academy course').length, Pages: pageItems.length };

  return <main className="min-h-[70vh] bg-slate-50 text-slate-950">
    <section className="bg-[#142535] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-6xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-teal-300">ARTIC HUB discovery</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Find your next destination</h1><p className="mt-3 max-w-2xl text-slate-300">Search across live products, bookable services, Academy courses, and the areas of ARTIC HUB. Every result shows where it belongs.</p>
        <form className="mt-7 flex max-w-3xl" onSubmit={(e) => { e.preventDefault(); }}><label className="sr-only" htmlFor="hub-discovery-search">Search all ARTIC HUB</label><input id="hub-discovery-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try ‘networking’, ‘training’, or ‘vehicle’" className="min-w-0 flex-1 rounded-l-xl bg-white px-4 py-3 text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400"/><button className="rounded-r-xl bg-teal-600 px-5 text-white hover:bg-teal-500" aria-label="Search"><Search className="h-5 w-5" /></button></form>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-9 sm:px-8">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter search results">{filters.map((item) => <button key={item} role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${filter === item ? 'border-teal-800 bg-teal-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:border-teal-700'}`}>{item}<span className="ml-2 opacity-75">{counts[item]}</span></button>)}</div>
      <div className="mb-5 mt-7 flex items-center justify-between gap-4"><h2 className="text-xl font-bold">{query.trim() ? `Results for “${query.trim()}”` : 'Explore ARTIC HUB'}</h2><span className="text-sm text-slate-600">{selectedItems.length} destinations</span></div>
      {loading ? <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-700">Searching products, services, and courses…</p> : error ? <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">Live results are temporarily unavailable. You can still open the ARTIC HUB sections below.</p> : null}
      {!loading && selectedItems.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-700">No results in this section yet. Try another filter or browse a destination below.</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{selectedItems.map((item) => {
        const Icon = item.kind === 'Product' ? ShoppingBag : item.kind === 'Service' ? Wrench : item.kind === 'Academy course' ? BookOpen : BriefcaseBusiness;
        const content = <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-900"><Icon className="h-5 w-5" /></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">{item.kind}</span></div><h3 className="mt-4 text-lg font-bold text-slate-950">{item.title}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-700">{item.summary || (typeof item.category === 'string' ? item.category : item.category?.name) || 'Open this area to explore details and available options.'}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-sm"><span className="font-semibold text-teal-900">Located in {item.location}</span>{item.external ? <ExternalLink className="h-4 w-4 text-slate-500" /> : <ArrowUpRight className="h-4 w-4 text-slate-500" />}</div></article>;
        return item.external ? <a key={`${item.kind}-${item.id}`} href={item.href} target="_blank" rel="noopener noreferrer" className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">{content}</a> : <Link key={`${item.kind}-${item.id}`} href={item.href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">{content}</Link>;
      })}</div>
    </section>
  </main>;
}
