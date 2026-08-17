'use client';

import { useQuery } from '@tanstack/react-query';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCallback } from 'react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
}

export default function HeroCarousel() {
  const locale = useLocale();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);

  const { data } = useQuery({
    queryKey: queryKeys.banners.active,
    queryFn: () => get<Banner[]>('/banners'),
    staleTime: 5 * 60 * 1000,
  });

  const banners = (data?.data as unknown as Banner[]) || [];
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!banners.length) {
    // Fallback banner with Unsplash image
    return (
      <div className="relative h-[280px] md:h-[460px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1500&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A2332]/90 via-[#1A2332]/60 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8 md:px-20">
          <div className="text-white max-w-xl">
            <p className="text-[#18A89A] text-sm font-bold uppercase tracking-widest mb-3">🔥 Welcome to ARTIC</p>
            <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              Shop Smart.<br />
              <span className="text-[#18A89A]">Live Better.</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8">Products, services & more — all in one place</p>
            <Link href={`/${locale}/search`}
              className="inline-flex items-center gap-2 bg-[#18A89A] hover:bg-[#0F7A70] text-white font-bold px-8 py-3.5 rounded-full transition-all hover:scale-105 shadow-xl">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="flex-[0_0_100%] relative h-[280px] md:h-[460px]">
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                style={{ backgroundImage: `url('${banner.imageUrl}')` }}
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A2332]/85 via-[#1A2332]/50 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center px-8 md:px-20">
                <div className="text-white max-w-2xl">
                  <p className="text-[#18A89A] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-[#18A89A]" /> Limited Time Offer
                  </p>
                  <h2 className="text-3xl md:text-5xl font-black mb-3 leading-tight">{banner.title}</h2>
                  {banner.subtitle && (
                    <p className="text-lg text-gray-200 mb-7 max-w-lg">{banner.subtitle}</p>
                  )}
                  {banner.linkUrl && (
                    <Link
                      href={`/${locale}${banner.linkUrl.startsWith('/') ? banner.linkUrl : '/' + banner.linkUrl}`}
                      className="inline-flex items-center gap-2 bg-[#18A89A] hover:bg-[#0F7A70] text-white font-bold px-8 py-3.5 rounded-full transition-all hover:scale-105 shadow-xl text-sm"
                    >
                      {banner.buttonText || 'Shop Now'} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all" aria-label="Previous">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all" aria-label="Next">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
