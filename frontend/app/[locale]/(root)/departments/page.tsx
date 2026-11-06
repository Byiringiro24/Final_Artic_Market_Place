'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Building2, CircleCheck, Clock3, Layers3 } from 'lucide-react';
import { get } from '@/lib/api';

type Department = {
  id: string;
  name: string;
  path: string;
  apiBasePath: string;
  audience: string[];
  tier: number;
  status: string;
  available: boolean;
};

type DirectoryResponse = { version: number; updatedAt: string; departments: Department[] };

const tierNames: Record<number, string> = {
  1: 'Foundation',
  2: 'Growth',
  3: 'Expansion',
};

export default function DepartmentsPage() {
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['platform', 'departments'],
    queryFn: () => get<DirectoryResponse>('/platform/departments'),
    staleTime: 60_000,
  });
  const departments = data?.data.departments ?? [];

  return (
    <main className="min-h-[70vh] bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-4 py-2 text-sm font-semibold text-teal-200">
            <Layers3 className="h-4 w-4" /> ARTIC HUB DIRECTORY
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">One hub. Every ARTIC service.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Explore the company’s departments and products. Available areas open in the current hub; planned areas are clearly marked while they are being prepared.
          </p>
        </div>

        {isLoading && <p className="mt-12 text-slate-300">Loading the ARTIC directory…</p>}
        {isError && (
          <div className="mt-12 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-6 text-amber-100">
            <p>The directory service is temporarily unavailable.</p>
            <button onClick={() => void refetch()} className="mt-3 font-semibold underline underline-offset-4">Try again</button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="mt-12 space-y-14">
            {[1, 2, 3].map((tier) => {
              const items = departments.filter((department) => department.tier === tier);
              if (!items.length) return null;
              return (
                <section key={tier} aria-labelledby={`tier-${tier}`}>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Tier {tier}</p>
                      <h2 id={`tier-${tier}`} className="mt-1 text-2xl font-bold">{tierNames[tier]}</h2>
                    </div>
                    <span className="text-sm text-slate-400">{items.length} departments</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((department) => {
                      const destination = department.available
                        ? `/${locale}${department.id === 'marketplace' ? '/search' : department.path}`
                        : undefined;
                      const Card = (
                        <div className={`group h-full rounded-2xl border p-6 transition duration-200 ${department.available ? 'border-white/10 bg-white/[0.045] hover:-translate-y-1 hover:border-teal-300/40 hover:bg-white/[0.075]' : 'border-white/[0.07] bg-white/[0.02] opacity-75'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-300/10 text-teal-200"><Building2 className="h-6 w-6" /></span>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${department.available ? 'bg-emerald-300/10 text-emerald-200' : 'bg-slate-700/70 text-slate-300'}`}>
                              {department.available ? <CircleCheck className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                              {department.available ? 'Current system · migrating' : 'Planned'}
                            </span>
                          </div>
                          <h3 className="mt-5 text-xl font-semibold leading-snug">{department.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-400">For {department.audience.join(', ')}.</p>
                          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                            <span className="text-slate-400">{department.available ? 'Open current version' : 'Not open yet'}</span>
                            {department.available && <ArrowUpRight className="h-4 w-4 text-teal-200 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                          </div>
                        </div>
                      );
                      return destination ? <Link key={department.id} href={destination} className="block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300">{Card}</Link> : <article key={department.id}>{Card}</article>;
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
