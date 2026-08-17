'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Phone, Mail, MessageCircle, MapPin, Clock, Facebook,
  Twitter, Instagram, Linkedin, Youtube, HelpCircle,
  Package, RefreshCw, CreditCard, Store, ChevronDown, ChevronUp,
} from 'lucide-react';
import { get } from '@/lib/api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ContactMap {
  [key: string]: { value: string; label: string; group: string };
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  tiktok: <span className="text-sm font-bold">TT</span>,
};

const FAQ_ITEMS = [
  { q: 'How do I track my order?', a: 'Sign in to your account, go to Account → Your Orders, and click on the order to see real-time tracking.' },
  { q: 'What is your return policy?', a: 'We offer 30-day returns on most items. Items must be in original condition. Contact us to initiate a return.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 5–7 business days. Express delivery takes 2–3 days. Same-day delivery is available in Kigali.' },
  { q: 'How do I become a seller?', a: 'Visit our Sell on ARTIC page, fill out the application form, and our team will review it within 2 business days.' },
  { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards (Visa, Mastercard), PayPal, and Cash on Delivery.' },
  { q: 'How do I cancel an order?', a: 'Orders can be cancelled within 1 hour of placement. Go to Account → Orders → select order → Cancel Order.' },
  { q: 'Is my payment information secure?', a: 'Yes! All payments are processed via Stripe with industry-standard SSL encryption. We never store card details.' },
  { q: 'Can I change my delivery address after ordering?', a: 'Address changes are only possible before the order ships. Contact us immediately via WhatsApp or email.' },
];

export default function CustomerServicePage() {
  const locale = useLocale();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data } = useQuery({
    queryKey: ['contact-info'],
    queryFn: () => get<ContactMap>('/contact'),
    staleTime: 5 * 60 * 1000,
  });

  const contact = (data?.data as unknown as ContactMap) || {};
  const socialKeys = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'];

  return (
    <div className="bg-artic-light min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-artic-navy to-artic-navy-light text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-artic-teal/20 border border-artic-teal/30 text-artic-teal text-sm px-4 py-1.5 rounded-full mb-4">
            <HelpCircle className="h-4 w-4" /> Customer Support
          </div>
          <h1 className="text-4xl font-black mb-3">
            How can we <span className="text-artic-teal">help you?</span>
          </h1>
          <p className="text-gray-300 text-lg">
            {contact.support_hours?.value || 'Mon–Fri: 8AM–6PM | Sat: 9AM–3PM'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* Quick help tiles */}
        <section>
          <h2 className="text-xl font-bold mb-5">What do you need help with?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: 'Track an Order', href: `/${locale}/account/orders`, color: 'text-blue-600 bg-blue-50' },
              { icon: RefreshCw, label: 'Returns & Refunds', href: `/${locale}/page/returns`, color: 'text-green-600 bg-green-50' },
              { icon: CreditCard, label: 'Payment Issues', href: `/${locale}/page/payment`, color: 'text-purple-600 bg-purple-50' },
              { icon: Store, label: 'Seller Support', href: `/${locale}/sell`, color: 'text-artic-teal bg-artic-teal/10' },
            ].map(({ icon: Icon, label, href, color }) => (
              <Link key={label} href={href} className="bg-white border rounded-xl p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-artic-teal">{label}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact channels + social + map */}
        <section className="grid md:grid-cols-[1fr_1fr_1fr] gap-6">
          {/* Direct contact */}
          <div className="bg-white border rounded-xl p-6 space-y-5">
            <h3 className="font-bold text-lg">Contact Us Directly</h3>

            {contact.whatsapp && (
              <a
                href={`https://wa.me/250${contact.whatsapp.value.replace(/^0/, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-green-800">WhatsApp Chat</p>
                  <p className="text-xs text-green-600">{contact.whatsapp.value} — Chat now</p>
                </div>
              </a>
            )}

            {(contact.phone1 || contact.phone2) && (
              <div className="flex items-start gap-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-blue-800">Phone</p>
                  {contact.phone1 && (
                    <a href={`tel:${contact.phone1.value}`} className="text-xs text-blue-600 hover:underline block">
                      {contact.phone1.value}
                    </a>
                  )}
                  {contact.phone2 && (
                    <a href={`tel:${contact.phone2.value}`} className="text-xs text-blue-600 hover:underline block">
                      {contact.phone2.value}
                    </a>
                  )}
                </div>
              </div>
            )}

            {contact.email && (
              <a
                href={`mailto:${contact.email.value}`}
                className="flex items-center gap-4 p-3 bg-artic-teal/5 border border-artic-teal/20 rounded-lg hover:bg-artic-teal/10 transition-colors"
              >
                <div className="w-10 h-10 bg-artic-teal rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Email Support</p>
                  <p className="text-xs text-artic-teal">{contact.email.value}</p>
                </div>
              </a>
            )}
          </div>

          {/* Social media */}
          <div className="bg-white border rounded-xl p-6">
            <h3 className="font-bold text-lg mb-5">Follow Us</h3>
            <div className="space-y-3">
              {socialKeys.map((key) => {
                const info = contact[key];
                if (!info?.value) return null;
                return (
                  <a
                    key={key}
                    href={info.value.startsWith('http') ? info.value : `https://${info.value}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-artic-light transition-colors group"
                  >
                    <div className="w-9 h-9 bg-artic-navy rounded-lg flex items-center justify-center text-white">
                      {SOCIAL_ICONS[key] || <span className="text-xs">{key[0].toUpperCase()}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{info.label || key}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">{info.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Address + hours */}
          <div className="bg-white border rounded-xl p-6 space-y-5">
            <h3 className="font-bold text-lg">Visit Us</h3>

            {contact.address && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-artic-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-artic-teal" />
                </div>
                <div>
                  <p className="font-medium text-sm">Address</p>
                  <p className="text-sm text-gray-600">{contact.address.value}</p>
                </div>
              </div>
            )}

            {contact.support_hours && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-artic-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-artic-teal" />
                </div>
                <div>
                  <p className="font-medium text-sm">Support Hours</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{contact.support_hours.value}</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button asChild className="w-full bg-artic-teal hover:bg-artic-teal-dark text-white rounded-full">
                <a href={`https://wa.me/250${(contact.whatsapp?.value || '0787585826').replace(/^0/, '')}`}
                  target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Support
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-artic-teal" /> Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-artic-light transition-colors"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-medium text-sm pr-4">{item.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-artic-teal flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 border-t bg-artic-light/50">
                    <p className="pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-gradient-to-r from-artic-teal to-artic-teal-dark rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
          <p className="text-teal-100 mb-6 max-w-md mx-auto">
            Our support team is available {contact.support_hours?.value || 'Mon–Fri 8AM–6PM'}.
            We typically respond within 2 hours.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild className="bg-white text-artic-teal hover:bg-gray-100 font-bold rounded-full px-8">
              <a href={`mailto:${contact.email?.value || 'articltd1@gmail.com'}`}>
                <Mail className="h-4 w-4 mr-2" /> Send Email
              </a>
            </Button>
            <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-8">
              <a href={`https://wa.me/250${(contact.whatsapp?.value || '0787585826').replace(/^0/, '')}`}
                target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
              </a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
