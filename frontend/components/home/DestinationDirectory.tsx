'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight, BookOpen, Building2, CircleHelp, ExternalLink,
  Heart, LayoutDashboard, LockKeyhole, MapPin, Search, Settings,
  ShoppingBag, Store, Ticket, UserPlus, Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Destination = {
  title: string;
  description: string;
  section: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  note?: string;
};

const MORE_SERVICES = [
  'Business directory', 'Jobs & internships', 'Events & webinars', 'Digital products',
  'Memberships & subscriptions', 'Hotel management', 'Property & tenant tools',
  'Health companion (separate product)', 'Agricultural IoT (separate product)',
  'AI service layer',
];

export default function DestinationDirectory({ locale }: { locale: string }) {
  const reduceMotion = useReducedMotion();
  const [section, setSection] = useState('All');
  const [query, setQuery] = useState('');

  const destinations = useMemo<Destination[]>(() => [
    { title: 'Browse marketplace', description: 'Search products, categories, and sellers.', section: 'Shop', href: `/${locale}/search`, icon: ShoppingBag },
    { title: 'Deals & offers', description: 'See current marketplace promotions.', section: 'Shop', href: `/${locale}/deals`, icon: Ticket },
    { title: 'Saved products', description: 'Return to items on your wishlist.', section: 'Shop', href: `/${locale}/wishlist`, icon: Heart },
    { title: 'ARTIC Academy', description: 'Explore available courses and learning paths.', section: 'Learn', href: `/${locale}/academy`, icon: BookOpen },
    { title: 'Training registration', description: 'Register interest in an ARTIC training program.', section: 'Learn', href: `/${locale}/academy/training-registration`, icon: UserPlus },
    { title: 'Professional services', description: 'Browse service listings and request a booking.', section: 'Build', href: `/${locale}/services`, icon: Wrench },
    { title: 'Become a seller or provider', description: 'Apply to list products or services.', section: 'Build', href: `/${locale}/sell`, icon: Store },
    { title: 'Help & customer support', description: 'Find support and ARTIC contact information.', section: 'Help', href: `/${locale}/customer-service`, icon: CircleHelp },
    { title: 'Account overview', description: 'Open your personal ARTIC HUB account.', section: 'Account', href: `/${locale}/account`, icon: LayoutDashboard },
    { title: 'Orders & tracking', description: 'Review purchases and order status.', section: 'Account', href: `/${locale}/account/orders`, icon: ShoppingBag },
    { title: 'Saved addresses', description: 'Manage delivery addresses in your account.', section: 'Account', href: `/${locale}/account/addresses`, icon: MapPin },
    { title: 'Your reviews', description: 'Review products and view your feedback.', section: 'Account', href: `/${locale}/account/reviews`, icon: BookOpen },
    { title: 'Notifications', description: 'See account, order, and service updates.', section: 'Account', href: `/${locale}/account/notifications`, icon: Ticket },
    { title: 'Account settings', description: 'Update profile and security settings.', section: 'Account', href: `/${locale}/account/settings`, icon: Settings },
    { title: 'Sign in', description: 'Access your ARTIC HUB account.', section: 'Account', href: `/${locale}/sign-in`, icon: LockKeyhole },
    { title: 'Create an account', description: 'Register for ARTIC HUB.', section: 'Account', href: `/${locale}/sign-up`, icon: UserPlus },
    { title: 'Reset your password', description: 'Request an account password reset.', section: 'Account', href: `/${locale}/forgot-password`, icon: LockKeyhole },
    { title: 'About ARTIC', description: 'Read the ARTIC Group company information.', section: 'Company', href: `/${locale}/page/about-us`, icon: Building2 },
    { title: 'Frequently asked questions', description: 'Get quick answers about the platform.', section: 'Help', href: `/${locale}/page/faq`, icon: CircleHelp },
    { title: 'Privacy policy', description: 'Read how account and service data is handled.', section: 'Company', href: `/${locale}/page/privacy-policy`, icon: LockKeyhole },
    { title: 'Terms of service', description: 'Review the ARTIC HUB terms.', section: 'Company', href: `/${locale}/page/terms-of-service`, icon: BookOpen },
    { title: 'ARTIC VMS home', description: 'Open the separate vehicle monitoring product.', section: 'ARTIC VMS', href: 'https://articvms.ddnsgeek.com', icon: ExternalLink, external: true, note: 'Separate product' },
    { title: 'VMS personal registration', description: 'Register an individual VMS account.', section: 'ARTIC VMS', href: 'https://articvms.ddnsgeek.com/register?type=personal', icon: UserPlus, external: true, note: 'Separate account' },
    { title: 'VMS company registration', description: 'Register a company VMS account.', section: 'ARTIC VMS', href: 'https://articvms.ddnsgeek.com/register?type=company', icon: Building2, external: true, note: 'Separate account' },
    { title: 'VMS sign in', description: 'Sign in to the ARTIC VMS platform.', section: 'ARTIC VMS', href: 'https://articvms.ddnsgeek.com/login', icon: LockKeyhole, external: true, note: 'Separate sign-in' },
  ], [locale]);

  const sections = ['All', 'Shop', 'Learn', 'Build', 'Account', 'Help', 'ARTIC VMS', 'Company'];
  const filtered = destinations.filter((item) => {
    const matchesSection = section === 'All' || item.section === section;
    const search = `${item.title} ${item.description} ${item.section}`.toLocaleLowerCase();
    return matchesSection && search.includes(query.trim().toLocaleLowerCase());
  });

  return (
    <section id="all-pages" className="scroll-mt-24 border-y border-slate-200 bg-[#f8fafb] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-800">ARTIC HUB site map</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Every destination, one tap away.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Browse the live pages across ARTIC HUB. Product and service detail pages open from their catalogs; ARTIC VMS keeps its own registration and sign-in.</p>
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Search pages and services</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a page or service…" className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" />
          </label>
        </div>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Filter destinations by section">
          {sections.map((name) => <button key={name} type="button" onClick={() => setSection(name)} aria-pressed={section === name} className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${section === name ? 'border-[#102638] bg-[#102638] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-900'}`}>{name}</button>)}
        </div>

        <motion.div layout className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, index) => {
              const Icon = item.icon;
              const card = <><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-900 transition group-hover:bg-[#102638] group-hover:text-teal-200"><Icon className="h-4 w-4" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-1.5 text-sm font-bold text-slate-950">{item.title}{item.external && <ArrowUpRight className="h-3 w-3 text-slate-400" />}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>{item.note && <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-800">{item.note}</span>}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-800" aria-hidden="true" /></>;
              const className = 'group flex min-h-[116px] items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600';
              return <motion.div key={item.title} layout initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }} transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : Math.min(index * 0.015, 0.12) }}>{item.external ? <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>{card}</a> : <Link href={item.href} className={className}>{card}</Link>}</motion.div>;
            })}
          </AnimatePresence>
        </motion.div>
        {filtered.length === 0 && <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">No pages match that search. Try another word or choose “All”.</p>}

        <div className="mt-14 rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Planned modules · not live pages</p><h3 className="mt-2 text-2xl font-black text-slate-950">The ARTIC ecosystem is designed to grow.</h3></div><span className="text-xs text-slate-500">We’ll publish each module when it’s ready.</span></div>
          <div className="mt-5 flex flex-wrap gap-2">{MORE_SERVICES.map((name) => <span key={name} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"><span className="mr-1.5 text-amber-600">◌</span>{name}</span>)}</div>
        </div>
      </div>
    </section>
  );
}
