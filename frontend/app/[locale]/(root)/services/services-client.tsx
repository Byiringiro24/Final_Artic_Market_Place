'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { CheckCircle2, ArrowRight, Star, MessageCircle } from 'lucide-react';
import { get } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  title: string;
  slug: string;
  shortDesc?: string;
  description: string;
  price?: number;
  priceType: string;
  category: string;
  images: string[];
  isFeatured: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  Photography: '📸',
  Logistics: '🚚',
  Consulting: '💼',
  Branding: '🎨',
  Technology: '💻',
  Marketing: '📢',
  Finance: '💰',
  Legal: '⚖️',
  Other: '🛠',
};

export default function ServicesClient() {
  const locale = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: ['services-public'],
    queryFn: () => get<Service[]>('/services'),
  });

  const services = (data?.data as unknown as Service[]) || [];
  const featured = services.filter((s) => s.isFeatured);
  const byCategory = services.reduce<Record<string, Service[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="bg-artic-light min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-artic-navy via-artic-navy-light to-[#1a3a4a] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-artic-teal/20 text-artic-teal border border-artic-teal/30 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Professional Services
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Services that{' '}
            <span className="text-artic-teal">grow your business</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            From product photography to last-mile delivery — ARTIC Marketplace connects you with trusted professionals.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild className="bg-artic-teal hover:bg-artic-teal-dark text-white rounded-full px-8 font-semibold">
              <a href="#all-services">Explore Services</a>
            </Button>
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8">
              <Link href={`/${locale}/sell`}>Become a Seller</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: '✅', label: 'Verified Providers' },
            { icon: '💬', label: '24/7 Support' },
            { icon: '🔒', label: 'Secure Payments' },
            { icon: '⭐', label: 'Rated by Customers' },
          ].map((b) => (
            <div key={b.label} className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span className="text-xl">{b.icon}</span>
              <span className="font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {/* Featured services */}
        {featured.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 text-artic-gold fill-artic-gold" /> Featured Services
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((s) => (
                <ServiceCard key={s.id} service={s} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* By category */}
        <section id="all-services">
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton h-48 rounded-xl" />
              ))}
            </div>
          ) : Object.keys(byCategory).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-5xl">🛠</span>
              <p className="mt-3 text-lg">Services coming soon!</p>
            </div>
          ) : (
            Object.entries(byCategory).map(([category, items]) => (
              <div key={category} className="mb-10">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <span className="text-2xl">{CATEGORY_ICONS[category] || '🛠'}</span>
                  {category}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((s) => <ServiceCard key={s.id} service={s} locale={locale} />)}
                </div>
              </div>
            ))
          )}
        </section>

        {/* CTA: become a service provider */}
        <section className="bg-gradient-to-r from-artic-teal to-[#0F7A70] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Offer your services on ARTIC</h2>
          <p className="text-teal-100 mb-6">
            Are you a professional? Join ARTIC Marketplace as a service provider and reach thousands of customers.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild className="bg-white text-artic-teal hover:bg-gray-100 font-bold rounded-full px-8">
              <Link href={`/${locale}/sell`}>Apply as Seller/Provider</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full">
              <Link href={`/${locale}/customer-service`}>Contact Us</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ServiceCard({ service, locale }: { service: Service; locale: string }) {
  const priceDisplay =
    service.priceType === 'quote'
      ? 'Get a Quote'
      : service.priceType === 'hourly'
      ? `$${service.price}/hr`
      : service.price
      ? `From $${service.price}`
      : 'Contact for pricing';

  return (
    <Link
      href={`/${locale}/services/${service.slug}`}
      className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all group block"
    >
      {/* Image or placeholder */}
      <div className="h-36 bg-gradient-to-br from-artic-teal/10 to-artic-teal/5 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        {service.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <span className="text-4xl">{CATEGORY_ICONS[service.category] || '🛠'}</span>
        )}
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-artic-teal uppercase tracking-wider bg-artic-teal/10 px-2 py-0.5 rounded-full">
          {service.category}
        </span>
        <h3 className="font-bold text-gray-900 group-hover:text-artic-teal transition-colors">
          {service.title}
        </h3>
        {service.shortDesc && (
          <p className="text-sm text-gray-500 line-clamp-2">{service.shortDesc}</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-artic-teal">{priceDisplay}</span>
          <span className="text-artic-teal opacity-0 group-hover:opacity-100 transition-opacity text-sm flex items-center gap-1">
            Learn more <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
