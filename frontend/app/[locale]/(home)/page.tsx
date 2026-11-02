import { Suspense } from 'react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import HeroCarousel from '@/components/home/HeroCarousel';
import HubServiceDirectory from '@/components/home/HubServiceDirectory';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import DealsSection from '@/components/home/DealsSection';
import TrendingSection from '@/components/home/TrendingSection';
import ServicesStrip from '@/components/home/ServicesStrip';
import BrowsingHistorySection from '@/components/home/BrowsingHistorySection';
import { HeroCarouselSkeleton } from '@/components/skeletons/HeroCarouselSkeleton';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <main className="min-h-screen bg-[#F0F4F8]">
      <section className="relative isolate overflow-hidden bg-[#111C2B] px-4 py-16 text-white md:py-24">
        <div aria-hidden="true" className="absolute -right-28 -top-40 h-[28rem] w-[28rem] rounded-full bg-teal-500/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-52 left-1/4 h-[26rem] w-[26rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-300">ARTIC Group Ltd</p>
            <p className="mt-2 text-sm font-medium tracking-wide text-slate-300">Engineering <span className="text-teal-400">•</span> Technology <span className="text-teal-400">•</span> Innovation</p>
            <h1 className="mt-8 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">ARTIC <span className="text-teal-300">HUB</span></h1>
            <p className="mt-4 text-lg font-semibold text-slate-200 md:text-xl">Enterprise Management Platform</p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">One place to shop, learn, find professional services, and connect with ARTIC Group’s digital platforms.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#hub-services" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-400 px-6 font-bold text-slate-950 transition hover:bg-teal-300">Explore services <span className="ml-2" aria-hidden="true">↓</span></a>
              <Link href={`/${locale}/search`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-6 font-bold text-white transition hover:bg-white/10">Browse marketplace</Link>
              <a href="https://articvms.ddnsgeek.com" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl px-3 font-semibold text-slate-200 underline decoration-white/30 underline-offset-4 transition hover:text-white">Open ARTIC VMS ↗</a>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-sm md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Your starting point</p>
            <h2 className="mt-3 text-2xl font-extrabold">What would you like to do?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Choose a destination and continue directly to that service.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { title: 'Shop products', href: `/${locale}/search`, icon: '🛍️' },
                { title: 'Learn a skill', href: `/${locale}/academy`, icon: '🎓' },
                { title: 'Find a service', href: `/${locale}/services`, icon: '🧰' },
                { title: 'Get support', href: `/${locale}/customer-service`, icon: '💬' },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 transition hover:border-teal-300/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
                  <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                  <span className="mt-3 block text-sm font-bold">{item.title}</span>
                  <span className="mt-1 block text-xs text-slate-400">Go to service →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HubServiceDirectory locale={locale} />

      <div className="container mx-auto space-y-12 px-4 py-12">
        <section aria-labelledby="marketplace-heading" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Shop on ARTIC HUB</p>
          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 id="marketplace-heading" className="text-2xl font-black text-slate-950 md:text-3xl">Marketplace highlights</h2>
              <p className="mt-1 text-sm text-slate-600">Browse products, categories, and current offers.</p>
            </div>
            <Link href={`/${locale}/search`} className="font-semibold text-teal-800 hover:underline">View marketplace →</Link>
          </div>
        </section>

        <Suspense fallback={<HeroCarouselSkeleton />}>
          <HeroCarousel />
        </Suspense>

        {/* Categories */}
        <Suspense fallback={<div className="h-32 skeleton rounded-xl" />}>
          <CategoryGrid />
        </Suspense>

        {/* Featured products */}
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <FeaturedProducts />
        </Suspense>

        {/* Services strip */}
        <Suspense fallback={null}>
          <ServicesStrip />
        </Suspense>

        {/* Today's deals */}
        <Suspense fallback={<ProductGridSkeleton count={6} />}>
          <DealsSection />
        </Suspense>

        {/* Trending */}
        <Suspense fallback={<ProductGridSkeleton count={6} />}>
          <TrendingSection />
        </Suspense>

        {/* Sell CTA banner */}
        <div className="bg-gradient-to-r from-[#1A2332] to-[#243044] rounded-2xl overflow-hidden">
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <p className="text-[#18A89A] text-sm font-bold uppercase tracking-widest mb-2">💼 For businesses</p>
              <h2 className="text-2xl md:text-3xl font-black mb-2">Bring your business to ARTIC HUB</h2>
              <p className="text-gray-400">Apply to sell products or explore professional services on the platform.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href={`/${locale}/sell`} className="inline-flex items-center gap-2 bg-[#18A89A] hover:bg-[#0F7A70] text-white font-bold px-6 py-3 rounded-full transition-all hover:scale-105 whitespace-nowrap">
                Become a Seller →
              </Link>
              <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-full transition-all whitespace-nowrap">
                Our Services
              </Link>
            </div>
          </div>
        </div>

        {/* Browsing history */}
        <Suspense fallback={null}>
          <BrowsingHistorySection />
        </Suspense>
      </div>
    </main>
  );
}
