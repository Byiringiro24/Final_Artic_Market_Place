import { Suspense } from 'react';
import HeroCarousel from '@/components/home/HeroCarousel';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import DealsSection from '@/components/home/DealsSection';
import BrowsingHistorySection from '@/components/home/BrowsingHistorySection';
import { HeroCarouselSkeleton } from '@/components/skeletons/HeroCarouselSkeleton';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-artic-light-bg">
      {/* Hero Carousel */}
      <Suspense fallback={<HeroCarouselSkeleton />}>
        <HeroCarousel />
      </Suspense>

      <div className="container mx-auto px-4 py-6 space-y-10">
        {/* Category Grid */}
        <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded-lg" />}>
          <CategoryGrid />
        </Suspense>

        {/* Featured Products */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <FeaturedProducts />
          </Suspense>
        </section>

        {/* Deals */}
        <Suspense fallback={<ProductGridSkeleton count={6} />}>
          <DealsSection />
        </Suspense>

        {/* Browsing History (personalized) */}
        <Suspense fallback={null}>
          <BrowsingHistorySection />
        </Suspense>
      </div>
    </main>
  );
}
