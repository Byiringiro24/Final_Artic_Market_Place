'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, CheckCircle2, MessageCircle, Phone, Mail } from 'lucide-react';
import { get } from '@/lib/api';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface Service {
  id: string; title: string; slug: string; description: string;
  shortDesc?: string; price?: number; priceType: string;
  category: string; images: string[]; videos: string[];
}

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const locale = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => get<Service>(`/services/${slug}`),
  });

  if (isLoading) return <div className="container mx-auto px-4 py-12"><div className="skeleton h-96 rounded-xl" /></div>;

  const service = data?.data as unknown as Service;
  if (!service) return <div className="container mx-auto px-4 py-12 text-center text-gray-500">Service not found</div>;

  const priceDisplay =
    service.priceType === 'quote' ? 'Get a Free Quote' :
    service.priceType === 'hourly' ? `$${service.price}/hour` :
    service.price ? `From $${service.price}` : 'Contact for pricing';

  return (
    <div className="bg-artic-light min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 text-artic-teal hover:underline text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Link>

        <div className="grid md:grid-cols-[1fr_320px] gap-8">
          {/* Main content */}
          <div className="space-y-6">
            {/* Media */}
            {service.images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {service.images.slice(0, 4).map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={img} alt={`${service.title} ${i + 1}`}
                    className={`rounded-xl object-cover w-full ${i === 0 ? 'col-span-2 h-64' : 'h-40'}`} />
                ))}
              </div>
            )}

            {service.videos.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Service Videos</h3>
                {service.videos.map((v, i) => (
                  <video key={i} src={v} controls className="w-full rounded-xl" />
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl p-6 border">
              <span className="text-xs font-semibold text-artic-teal uppercase tracking-wider bg-artic-teal/10 px-2 py-0.5 rounded-full">
                {service.category}
              </span>
              <h1 className="text-3xl font-bold mt-3 mb-4">{service.title}</h1>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown>{service.description}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border rounded-xl p-5 sticky top-24">
              <p className="text-3xl font-bold text-artic-teal mb-1">{priceDisplay}</p>
              {service.priceType === 'hourly' && <p className="text-sm text-gray-500 mb-4">Billed per hour</p>}
              {service.priceType === 'fixed' && <p className="text-sm text-gray-500 mb-4">One-time payment</p>}
              {service.priceType === 'quote' && <p className="text-sm text-gray-500 mb-4">Custom pricing based on your needs</p>}

              <div className="space-y-3 mb-5">
                <Button asChild className="w-full bg-artic-teal hover:bg-artic-teal-dark text-white rounded-full font-semibold">
                  <a href="https://wa.me/250787585826" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-full border-artic-teal text-artic-teal hover:bg-artic-teal/5">
                  <a href="mailto:articltd1@gmail.com">
                    <Mail className="h-4 w-4 mr-2" /> Email Us
                  </a>
                </Button>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {[
                  'Verified professional providers',
                  'Satisfaction guaranteed',
                  'Secure payment',
                  'Free consultation available',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-artic-teal flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-xl p-4 text-sm">
              <p className="font-semibold mb-2">Contact Support</p>
              <a href="tel:0787585826" className="flex items-center gap-2 text-artic-teal hover:underline mb-1">
                <Phone className="h-4 w-4" /> 0787585826
              </a>
              <a href="tel:0785424098" className="flex items-center gap-2 text-artic-teal hover:underline">
                <Phone className="h-4 w-4" /> 0785424098
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
