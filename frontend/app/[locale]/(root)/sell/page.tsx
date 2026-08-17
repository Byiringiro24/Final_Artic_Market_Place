'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Package, TrendingUp, Shield, Globe, CheckCircle2,
  Store, Loader2, ArrowRight, Star,
} from 'lucide-react';
import { get, post } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  businessName: z.string().min(2, 'Business name required'),
  businessType: z.string().min(2, 'Business type required'),
  description: z.string().min(20, 'Tell us more about your business (min 20 chars)'),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  phone: z.string().min(7, 'Phone number required'),
  address: z.string().min(5, 'Address required'),
});
type FormData = z.infer<typeof schema>;

const BUSINESS_TYPES = [
  'Individual / Freelancer',
  'Small Business (1–10 employees)',
  'Medium Business (11–50 employees)',
  'Large Business (50+ employees)',
  'Service Provider',
  'Manufacturer',
  'Distributor / Wholesaler',
  'Retailer',
];

const BENEFITS = [
  { icon: Package, title: 'Reach Thousands', desc: 'List your products in front of our growing customer base.' },
  { icon: TrendingUp, title: 'Grow Your Sales', desc: 'Analytics, promotions, and tools to scale your business.' },
  { icon: Shield, title: 'Secure Payments', desc: 'Fast, reliable payouts with buyer/seller protection.' },
  { icon: Globe, title: 'Go Beyond Borders', desc: 'Reach customers locally and across the region.' },
];

export default function SellPage() {
  const locale = useLocale();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: appData } = useQuery({
    queryKey: ['my-seller-application'],
    queryFn: () => get<{ status: string; businessName: string } | null>('/sellers/my-application'),
    enabled: isAuthenticated,
  });

  const existingApp = appData?.data as unknown as { status: string; businessName: string } | null;

  const {
    register, handleSubmit, formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => post('/sellers/apply', data),
    onSuccess: () => { setSubmitted(true); toast({ title: '🎉 Application submitted!' }); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });

  return (
    <div className="bg-artic-light min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-artic-navy to-artic-navy-light text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-artic-teal/20 border border-artic-teal/30 text-artic-teal text-sm px-4 py-1.5 rounded-full mb-5">
            <Store className="h-4 w-4" /> Seller Program
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Start Selling on <span className="text-artic-teal">ARTIC Marketplace</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of sellers growing their business on ARTIC. Apply today and reach customers across the region.
          </p>
          <div className="flex gap-4 justify-center text-sm text-gray-300">
            {['Free to apply', 'Quick approval', 'Dedicated support'].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-artic-teal" /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border rounded-xl p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-artic-teal/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-artic-teal" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>

        {/* Application form */}
        <div className="grid md:grid-cols-[1fr_340px] gap-8">
          <div className="bg-white border rounded-xl p-8">
            {/* Not logged in */}
            {!isAuthenticated && (
              <div className="text-center py-8">
                <Store className="h-16 w-16 text-artic-teal mx-auto mb-4 opacity-60" />
                <h2 className="text-xl font-bold mb-2">Sign in to Apply</h2>
                <p className="text-gray-500 mb-6 text-sm">You need an account to apply as a seller.</p>
                <div className="flex gap-3 justify-center">
                  <Button asChild className="bg-artic-teal hover:bg-artic-teal-dark text-white rounded-full">
                    <Link href={`/${locale}/sign-in?redirect=/${locale}/sell`}>Sign In</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-artic-teal text-artic-teal">
                    <Link href={`/${locale}/sign-up`}>Create Account</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Already applied */}
            {isAuthenticated && existingApp && !submitted && (
              <div className="text-center py-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                  existingApp.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  existingApp.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {existingApp.status === 'APPROVED' ? '✅ Approved' :
                   existingApp.status === 'REJECTED' ? '❌ Not Approved' :
                   '⏳ Under Review'}
                </div>
                <h2 className="text-xl font-bold mb-2">{existingApp.businessName}</h2>
                {existingApp.status === 'PENDING' && (
                  <p className="text-gray-500 text-sm">Your application is being reviewed. We&apos;ll contact you via email.</p>
                )}
                {existingApp.status === 'APPROVED' && (
                  <p className="text-gray-600 text-sm mb-4">Your seller account is active. Start listing products!</p>
                )}
                {existingApp.status === 'REJECTED' && (
                  <>
                    <p className="text-gray-500 text-sm mb-4">You can reapply with updated information.</p>
                    <Button className="bg-artic-teal text-white rounded-full" onClick={() => setSubmitted(false)}>
                      Reapply
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Success */}
            {submitted && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-artic-teal mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                <p className="text-gray-500 mb-6">We&apos;ll review your application and contact you at {user?.email} within 2 business days.</p>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/${locale}`}>Back to Home</Link>
                </Button>
              </div>
            )}

            {/* Form */}
            {isAuthenticated && !existingApp && !submitted && (
              <>
                <h2 className="text-2xl font-bold mb-6">Apply to Sell on ARTIC</h2>
                <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Business / Store Name *</Label>
                      <Input className="mt-1" {...register('businessName')} placeholder="e.g., TechZone Rwanda" />
                      {errors.businessName && <p className="text-destructive text-xs mt-1">{errors.businessName.message}</p>}
                    </div>
                    <div>
                      <Label>Business Type *</Label>
                      <select {...register('businessType')} className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal">
                        <option value="">Select type...</option>
                        {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.businessType && <p className="text-destructive text-xs mt-1">{errors.businessType.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label>Tell us about your business *</Label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      placeholder="What do you sell? Who are your customers? What makes your business unique?"
                      className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal resize-none"
                    />
                    {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Phone Number *</Label>
                      <Input className="mt-1" {...register('phone')} placeholder="0787000000" />
                      {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <Label>Website (optional)</Label>
                      <Input className="mt-1" {...register('website')} placeholder="https://yoursite.com" />
                    </div>
                  </div>

                  <div>
                    <Label>Business Address *</Label>
                    <Input className="mt-1" {...register('address')} placeholder="e.g., KG 11 Ave, Kigali, Rwanda" />
                    {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
                  </div>

                  <Button type="submit" disabled={isPending} className="w-full bg-artic-teal hover:bg-artic-teal-dark text-white rounded-full h-12 font-semibold text-base">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                    Submit Application
                  </Button>

                  <p className="text-xs text-gray-400 text-center">
                    By applying, you agree to ARTIC&apos;s{' '}
                    <Link href={`/${locale}/page/terms-of-service`} className="text-artic-teal hover:underline">Seller Terms</Link>.
                  </p>
                </form>
              </>
            )}
          </div>

          {/* Sidebar: How it works */}
          <div className="space-y-4">
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-bold mb-4">How It Works</h3>
              <ol className="space-y-4">
                {[
                  { step: '1', title: 'Apply', desc: 'Fill out the application form with your business details.' },
                  { step: '2', title: 'Get Reviewed', desc: 'Our team reviews your application within 2 business days.' },
                  { step: '3', title: 'Get Approved', desc: "You'll receive an email with your seller account access." },
                  { step: '4', title: 'Start Selling', desc: 'List products, manage orders, and grow your business.' },
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-3">
                    <span className="w-7 h-7 rounded-full bg-artic-teal text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{title}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-artic-teal/5 border border-artic-teal/20 rounded-xl p-4">
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4 fill-artic-gold text-artic-gold" />)}
              </div>
              <p className="text-sm text-gray-700 italic">
                &ldquo;ARTIC Marketplace helped us grow our customer base by 300% in just 6 months!&rdquo;
              </p>
              <p className="text-xs text-gray-500 mt-2 font-medium">— Seller on ARTIC</p>
            </div>

            <div className="bg-white border rounded-xl p-4 text-sm">
              <p className="font-semibold mb-2">Questions?</p>
              <p className="text-gray-500 text-xs mb-3">Our seller support team is ready to help you get started.</p>
              <Button asChild variant="outline" size="sm" className="w-full rounded-full border-artic-teal text-artic-teal hover:bg-artic-teal/5">
                <Link href={`/${locale}/customer-service`}>Contact Seller Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
