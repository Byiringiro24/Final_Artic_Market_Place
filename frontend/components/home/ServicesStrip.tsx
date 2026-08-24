'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowRight, Wrench } from 'lucide-react';
import { get } from '@/lib/api';

interface Service { id: string; title: string; slug: string; category: string; shortDesc?: string; price?: number; priceType: string }

const CATEGORY_ICONS: Record<string, string> = {
  Photography: '📸', Logistics: '🚚', Consulting: '💼',
  Branding: '🎨', Technology: '💻', 'Home Services': '🏠', Default: '🛠',
};

export default function ServicesStrip() {
  const locale = useLocale();

  const { data } = useQuery({
    queryKey: ['services-home'],
    queryFn: () => get<Service[]>('/services'),
    staleTime: 5 * 60 * 1000,
  });

  const services = (data?.data as unknown as Service[]) || [];
  if (!services.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-[#18A89A] rounded-full" />
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#18A89A]" /> Our Services
            </h2>
            <p className="text-sm text-gray-500">Professional services at your fingertips</p>
          </div>
        </div>
        <Link href={`/${locale}/services`} className="text-[#18A89A] hover:underline text-sm font-semibold flex items-center gap-1">
          All Services <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {services.slice(0, 5).map((s) => (
          <Link
            key={s.id}
            href={`/${locale}/services/${s.slug}`}
            className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#18A89A]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#18A89A]/20 transition-colors">
              <span className="text-2xl">{CATEGORY_ICONS[s.category] || CATEGORY_ICONS.Default}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-[#18A89A] line-clamp-2 leading-tight mb-1">
              {s.title}
            </h3>
            <p className="text-xs text-[#18A89A] font-medium">
              {s.priceType === 'quote' ? 'Get Quote' : s.price ? `From $${s.price}` : 'Contact us'}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
