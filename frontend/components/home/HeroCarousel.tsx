'use client';

import { useQuery } from '@tanstack/react-query';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';

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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  const { data } = useQuery({
    queryKey: queryKeys.banners.active,
    queryFn: () => get<Banner[]>('/banners'),
    staleTime: 5 * 60 * 1000,
  });

  const banners = data?.data || [];

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!banners.length) return null;

  return (
    <div className="relative overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="flex-[0_0_100%] relative h-[300px] md:h-[500px]">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              {/* Content */}
              <div className="absolute inset-0 flex items-center px-8 md:px-16">
                <div className="text-white max-w-xl">
                  <h2 className="text-3xl md:text-5xl font-bold mb-3">{banner.title}</h2>
                  {banner.subtitle && (
                    <p className="text-lg md:text-xl mb-6 text-gray-200">{banner.subtitle}</p>
                  )}
                  {banner.linkUrl && (
                    <Button
                      asChild
                      className="bg-artic-orange hover:bg-artic-orange-dark text-black font-bold rounded-full px-8"
                    >
                      <Link href={`/${locale}${banner.linkUrl}`}>
                        {banner.buttonText || 'Shop Now'}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
        aria-label="Next banner"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
