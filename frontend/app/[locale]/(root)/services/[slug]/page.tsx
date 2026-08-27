'use client';

import { use, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, CheckCircle2, MessageCircle, Phone, Mail, Calendar, Clock } from 'lucide-react';
import { get } from '@/lib/api';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import BookingModal from '@/components/services/BookingModal';

interface Service {
  id: string; title: string; slug: string; description: string;
  shortDesc?: string; price?: number; priceType: string;
  category: string; images: string[]; videos: string[];
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/api/v1').replace(/\/api\/v1$/, '');

function resolveMediaUrl(url?: string) {
  if (!url) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${normalized}`;
}

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const locale = useLocale();
  const [showBooking, setShowBooking] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => get<Service>(`/services/${slug}`),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="skeleton h-10 w-32 rounded mb-6" />
        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-4">
            <div className="skeleton h-64 rounded-xl" />
            <div className="skeleton h-96 rounded-xl" />
          </div>
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const service = data?.data as unknown as Service;

  useEffect(() => {
    if (!service?.images || service.images.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % service.images.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [service?.images]);

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">Service not found</p>
        <Link href={`/${locale}/services`} className="text-[#18A89A] hover:underline mt-3 block">Back to Services</Link>
      </div>
    );
  }

  const priceDisplay =
    service.priceType === 'quote' ? 'Get a Free Quote' :
    service.priceType === 'hourly' ? `$${service.price}/hour` :
    service.price ? `From $${service.price}` : 'Contact for pricing';

  return (
    <div className="bg-[#F0F4F8] min-h-screen py-8">
      {showBooking && (
        <BookingModal
          serviceId={service.id}
          serviceTitle={service.title}
          onClose={() => setShowBooking(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <Link href={`/${locale}/services`}
          className="inline-flex items-center gap-2 text-[#18A89A] hover:underline text-sm mb-6 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Services
        </Link>

        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          {/* Main content */}
          <div className="space-y-5">
            {/* Image gallery */}
            {service.images.length > 0 && (
              <div className="bg-white border rounded-xl p-3">
                <div className="relative overflow-hidden rounded-xl bg-gray-50">
                  <div className="aspect-[16/10] w-full">
                    <img
                      src={resolveMediaUrl(service.images[activeImage])}
                      alt={`${service.title} ${activeImage + 1}`}
                      className="h-full w-full object-contain p-3"
                    />
                  </div>
                  {service.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImage((current) => (current - 1 + service.images.length) % service.images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/50"
                        aria-label="Previous image"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImage((current) => (current + 1) % service.images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/50"
                        aria-label="Next image"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>
                {service.images.length > 1 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {service.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`overflow-hidden rounded-lg border-2 bg-gray-50 ${i === activeImage ? 'border-[#18A89A]' : 'border-transparent'}`}
                        aria-label={`Show image ${i + 1}`}
                      >
                        <img
                          src={resolveMediaUrl(img)}
                          alt={`${service.title} ${i + 1}`}
                          className="h-16 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Videos */}
            {service.videos?.length > 0 && (
              <div className="bg-white border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-800">Service Videos</h3>
                {service.videos.map((v, i) => (
                  <video key={i} src={resolveMediaUrl(v)} controls controlsList="nodownload" className="w-full rounded-lg max-h-96" />
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-[#18A89A] uppercase tracking-wider bg-[#18A89A]/10 px-3 py-1 rounded-full">
                  {service.category}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-4">{service.title}</h1>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown>{service.description}</ReactMarkdown>
              </div>
            </div>

            {/* Why choose us */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-bold text-gray-800 mb-4">Why Choose ARTIC Services?</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '✅', text: 'Verified Professionals' },
                  { icon: '🔒', text: 'Insured Services' },
                  { icon: '⭐', text: 'Top-Rated Providers' },
                  { icon: '💬', text: '24/7 Support' },
                  { icon: '📍', text: 'Location-Based Matching' },
                  { icon: '💰', text: 'Best Price Guarantee' },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-2 text-sm text-gray-700">
                    <span>{f.icon}</span> {f.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price + booking */}
            <div className="bg-white border rounded-xl p-5 sticky top-24">
              <div className="mb-4">
                <p className="text-3xl font-black text-[#18A89A]">{priceDisplay}</p>
                {service.priceType === 'hourly' && <p className="text-xs text-gray-500">Billed per hour</p>}
                {service.priceType === 'fixed' && <p className="text-xs text-gray-500">One-time payment</p>}
                {service.priceType === 'quote' && <p className="text-xs text-gray-500">Custom pricing based on your needs</p>}
              </div>

              {/* Book button */}
              <Button
                onClick={() => setShowBooking(true)}
                className="w-full bg-[#18A89A] hover:bg-[#0F7A70] text-white rounded-full h-12 font-bold text-base mb-3 gap-2"
              >
                <Calendar className="h-5 w-5" />
                Book Now
              </Button>

              {/* WhatsApp */}
              <a
                href="https://wa.me/250787585826"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border-2 border-green-500 text-green-700 hover:bg-green-50 rounded-full h-10 text-sm font-semibold transition-colors mb-3"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>

              {/* Contact info */}
              <div className="space-y-2 pt-3 border-t">
                <a href="tel:0787585826" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#18A89A]">
                  <Phone className="h-4 w-4 text-[#18A89A]" /> 0787585826
                </a>
                <a href="tel:0785424098" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#18A89A]">
                  <Phone className="h-4 w-4 text-[#18A89A]" /> 0785424098
                </a>
                <a href="mailto:articltd1@gmail.com" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#18A89A] truncate">
                  <Mail className="h-4 w-4 text-[#18A89A]" /> articltd1@gmail.com
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-4 pt-3 border-t space-y-1.5">
                {[
                  'Verified professional providers',
                  'Satisfaction guaranteed',
                  'Free consultation available',
                  '30-day money back guarantee',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#18A89A] flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#18A89A]" /> Service Hours
              </h3>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex justify-between"><span>Mon–Fri</span><span className="font-medium">8AM–6PM</span></div>
                <div className="flex justify-between"><span>Saturday</span><span className="font-medium">9AM–3PM</span></div>
                <div className="flex justify-between text-gray-400"><span>Sunday</span><span>Closed</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
