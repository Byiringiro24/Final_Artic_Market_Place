import { Suspense } from 'react';
import HeroCarousel from '@/components/home/HeroCarousel';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import DealsSection from '@/components/home/DealsSection';
import TrendingSection from '@/components/home/TrendingSection';
import ServicesStrip from '@/components/home/ServicesStrip';
import BrowsingHistorySection from '@/components/home/BrowsingHistorySection';
import { HeroCarouselSkeleton } from '@/components/skeletons/HeroCarouselSkeleton';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F0F4F8]">
      {/* Hero */}
      <Suspense fallback={<HeroCarouselSkeleton />}>
        <HeroCarousel />
      </Suspense>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🚚', title: 'Free Shipping', sub: 'On orders over $50' },
            { icon: '🔒', title: 'Secure Payment', sub: 'SSL encrypted checkout' },
            { icon: '↩️', title: '30-Day Returns', sub: 'Hassle-free returns' },
            { icon: '💬', title: '24/7 Support', sub: 'Chat, call or email us' },
          ].map((b) => (
            <div key={b.title} className="bg-white border rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="text-xs font-bold text-gray-800">{b.title}</p>
                <p className="text-[10px] text-gray-500">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>

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
              <p className="text-[#18A89A] text-sm font-bold uppercase tracking-widest mb-2">💼 Business Opportunity</p>
              <h2 className="text-2xl md:text-3xl font-black mb-2">Start selling on ARTIC today</h2>
              <p className="text-gray-400">Join thousands of sellers growing their business on our platform.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a href="./sell" className="inline-flex items-center gap-2 bg-[#18A89A] hover:bg-[#0F7A70] text-white font-bold px-6 py-3 rounded-full transition-all hover:scale-105 whitespace-nowrap">
                Become a Seller →
              </a>
              <a href="./services" className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-full transition-all whitespace-nowrap">
                Our Services
              </a>
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
