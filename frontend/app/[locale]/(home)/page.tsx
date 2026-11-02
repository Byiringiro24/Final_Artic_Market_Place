import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import {
  ArrowRight, ArrowUpRight, BookOpen, Boxes, Building2,
  CalendarDays, Check, Cpu, GraduationCap, Headphones, Lightbulb,
  Mail, MapPin, Phone, Radio, ShoppingBag, Sparkles, Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import DealsSection from '@/components/home/DealsSection';
import TrendingSection from '@/components/home/TrendingSection';
import ServicesStrip from '@/components/home/ServicesStrip';
import BrowsingHistorySection from '@/components/home/BrowsingHistorySection';
import HubReveal from '@/components/home/HubReveal';
import HubHero from '@/components/home/HubHero';
import HubScrollProgress from '@/components/home/HubScrollProgress';
import HubServiceTicker from '@/components/home/HubServiceTicker';
import DestinationDirectory from '@/components/home/DestinationDirectory';
import HomeQuickNav from '@/components/home/HomeQuickNav';
import IdeaSubmissionForm from '@/components/home/IdeaSubmissionForm';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

export const metadata: Metadata = {
  description: 'Explore ARTIC HUB: marketplace, practical learning, engineering services, and connected technology from ARTIC Group Ltd.',
};

const offerings: {
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
  href?: (locale: string) => string;
  external?: string;
  status: 'Available' | 'Coming next';
}[] = [
  {
    title: 'Marketplace', category: 'Shop & discover',
    description: 'Find useful products, explore offers, and connect with sellers in one convenient place.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=75',
    imageAlt: 'Customer completing a purchase at a modern checkout', icon: ShoppingBag,
    href: (locale) => `/${locale}/search`, status: 'Available',
  },
  {
    title: 'ARTIC Academy', category: 'Learn & grow',
    description: 'Build practical skills with courses and training registration for individuals and teams.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=75',
    imageAlt: 'Learners collaborating around a laptop', icon: GraduationCap,
    href: (locale) => `/${locale}/academy`, status: 'Available',
  },
  {
    title: 'Professional services', category: 'Plan & deliver',
    description: 'Explore ARTIC services, view project details, and request a booking or consultation.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=75',
    imageAlt: 'Engineers collaborating on a technical project', icon: Wrench,
    href: (locale) => `/${locale}/services`, status: 'Available',
  },
  {
    title: 'ARTIC VMS', category: 'Connected operations',
    description: 'Open ARTIC’s vehicle monitoring system for fleet visibility and operational tracking.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=75',
    imageAlt: 'Modern vehicle on an open road', icon: Radio,
    external: 'https://articvms.ddnsgeek.com', status: 'Available',
  },
  {
    title: 'Business directory', category: 'Find local expertise',
    description: 'Discover trusted businesses and professionals by location, service, and expertise.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=75',
    imageAlt: 'Small team discussing a project together', icon: Building2, status: 'Coming next',
  },
  {
    title: 'Digital products', category: 'Resources & tools',
    description: 'Access digital guides, templates, software, and resources from the ARTIC community.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=75',
    imageAlt: 'Laptop and workspace for digital work', icon: Boxes, status: 'Coming next',
  },
];

function SectionHeading({ kicker, title, text, light = false }: { kicker: string; title: string; text?: string; light?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-bold uppercase tracking-[0.22em] ${light ? 'text-teal-300' : 'text-teal-800'}`}>{kicker}</p>
      <h2 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${light ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
      {text && <p className={`mt-4 max-w-2xl text-base leading-7 ${light ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>}
    </div>
  );
}

function OfferingCard({ item, locale, index }: { item: (typeof offerings)[number]; locale: string; index: number }) {
  const Icon = item.icon;
  const image = (
    <>
      <div className="relative h-64 overflow-hidden sm:h-72">
        <Image src={item.image} alt={item.imageAlt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized className="object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-transparent" />
        <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
          <span className="rounded-full border border-white/30 bg-slate-950/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur">{item.status}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 transition duration-300 group-hover:-translate-y-1 group-hover:rotate-6"><Icon className="h-5 w-5" aria-hidden="true" /></span>
        </div>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200">{item.category}</p>
          <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
        </div>
      </div>
      <div className="flex min-h-[148px] flex-col p-5">
        <p className="text-sm leading-6 text-slate-600">{item.description}</p>
        {item.status === 'Available' && <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-teal-900">Explore service <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>}
        {item.status === 'Coming next' && <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-slate-500"><Sparkles className="h-4 w-4" /> In development</span>}
      </div>
    </>
  );

  const className = `group block overflow-hidden rounded-[1.65rem] border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${item.status === 'Available' ? 'border-slate-200 hover:border-teal-200' : 'border-dashed border-slate-300'}`;
  return (
    <HubReveal className="h-full" delay={index * 70}>
      {item.external ? (
        <a href={item.external} target="_blank" rel="noopener noreferrer" className={className}>{image}</a>
      ) : item.href ? (
        <Link href={item.href(locale)} className={className}>{image}</Link>
      ) : (
        <article className={className}>{image}</article>
      )}
    </HubReveal>
  );
}

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <main className="overflow-x-clip bg-white pb-16 text-slate-900 lg:pb-0">
      <HubScrollProgress />
      <HubHero locale={locale} />

      <HubServiceTicker />

      <section id="choose-path" className="scroll-mt-24 px-5 pb-10 pt-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <HubReveal>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <SectionHeading kicker="Start with what you need" title="Choose your ARTIC path." text="Four clear ways into the ARTIC ecosystem. The VMS path opens a separate product and sign-in." />
              <span className="font-mono text-[10px] uppercase tracking-[.16em] text-slate-400">01 / 04 paths</span>
            </div>
          </HubReveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: 'Shop', label: 'Marketplace', copy: 'Browse products, categories, and offers.', icon: ShoppingBag, href: `/${locale}/search`, tone: 'from-amber-950/90', image: offerings[0].image },
              { title: 'Learn', label: 'ARTIC Academy', copy: 'Explore courses and register for training.', icon: GraduationCap, href: `/${locale}/academy`, tone: 'from-violet-950/90', image: offerings[1].image },
              { title: 'Hire ARTIC', label: 'Services & projects', copy: 'Explore technical services and request a booking.', icon: Wrench, href: `/${locale}/services`, tone: 'from-teal-950/90', image: offerings[2].image },
              { title: 'Manage a fleet', label: 'ARTIC VMS', copy: 'Open VMS. A separate account is used there.', icon: Radio, href: 'https://articvms.ddnsgeek.com', external: true, tone: 'from-blue-950/90', image: offerings[3].image },
            ].map(({ title, label, copy, icon: Icon, href, external, tone, image }, index) => {
              const card = <><Image src={image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" unoptimized className="object-cover transition duration-700 group-hover:scale-105" /><div className={`absolute inset-0 bg-gradient-to-t ${tone} via-slate-950/25 to-slate-950/10`} /><div className="relative flex min-h-56 flex-col justify-between p-5 text-white"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur"><Icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-white/60 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" /></div><div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-teal-200">{label}</p><h3 className="mt-1 text-2xl font-black">{title}</h3><p className="mt-2 text-xs leading-5 text-white/80">{copy}</p></div></div></>;
              return <HubReveal key={title} delay={index * 60}>{external ? <a href={href} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-2xl bg-slate-900 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">{card}</a> : <Link href={href} className="group relative block overflow-hidden rounded-2xl bg-slate-900 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">{card}</Link>}</HubReveal>;
            })}
          </div>
        </div>
      </section>

      <section id="hub-services" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <HubReveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading kicker="One hub · Many ways forward" title="A connected place to get things moving." text="ARTIC brings useful services together—from everyday needs to practical skills and technical projects." />
              <Link href={`/${locale}/customer-service`} className="inline-flex shrink-0 items-center gap-2 pb-1 text-sm font-bold text-teal-900 hover:text-teal-700">Talk with our team <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </HubReveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {offerings.map((item, index) => <OfferingCard key={item.title} item={item} locale={locale} index={index} />)}
          </div>
          <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span className="mr-1 self-center">In development:</span>
            {['Business directory', 'Jobs & internships', 'Events & webinars', 'Digital products', 'Memberships', 'Hotel management', 'Property & tenant tools', 'Digital health · separate product', 'Agricultural IoT · separate product', 'AI-assisted services'].map((service) => <span key={service} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">{service}</span>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-y border-slate-200 bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <HubReveal><SectionHeading kicker="Connected by design" title="One clear journey. The right destination." text="ARTIC HUB brings several services together while letting each product keep the workflow it needs." /></HubReveal>
          <div className="relative mt-10 grid gap-4 md:grid-cols-4">
            <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-amber-300 via-teal-400 to-blue-400 md:block" />
            {[
              { label: 'Discover', title: 'Choose a path', text: 'Shop, learn, book, or manage a fleet.', Icon: Search },
              { label: 'Connect', title: 'Open the right service', text: 'Go directly to its catalog, course list, or portal.', Icon: Boxes },
              { label: 'Take action', title: 'Register or request', text: 'Use the service’s own sign-up, booking, or registration flow.', Icon: ArrowRight },
              { label: 'Continue', title: 'Manage your journey', text: 'Return to your account or contact the ARTIC team.', Icon: Building2 },
            ].map(({ label, title, text, Icon }, index) => <HubReveal key={label} delay={index * 80}><article className="relative h-full rounded-2xl border border-slate-200 bg-[#f8fafb] p-5 transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md"><span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-teal-900 shadow-sm"><Icon className="h-5 w-5" /></span><p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-teal-800">0{index + 1} · {label}</p><h3 className="mt-2 text-lg font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article></HubReveal>)}
          </div>
        </div>
      </section>

      <section id="engineering" className="scroll-mt-24 bg-[#f3f7f7] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <HubReveal className="relative">
            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] shadow-xl sm:min-h-[540px]">
              <Image src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=75" alt="Engineering team testing technology in a workshop" fill sizes="(max-width: 1024px) 100vw, 50vw" unoptimized className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
              <div className="absolute bottom-7 left-7 right-7 text-white sm:bottom-9 sm:left-9"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Ideas deserve a path forward</p><p className="mt-2 max-w-md text-2xl font-black sm:text-3xl">From a first conversation to a working solution.</p></div>
            </div>
            <div className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl transition-transform hover:-translate-y-1 sm:block sm:-right-5"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><Cpu className="h-5 w-5" /></span><span><span className="block text-xs text-slate-500">Make it practical</span><span className="block font-bold text-slate-900">Design · Build · Support</span></span></div></div>
          </HubReveal>
          <HubReveal delay={120}>
            <SectionHeading kicker="Ideas into impact" title="Have a challenge? Let’s work on it together." text="ARTIC Group combines technical skills and practical delivery to explore solutions in engineering, electronics, networking, embedded systems, AI integration, and connected services." />
            <div className="mt-8 space-y-4">
              {[
                ['01', 'Tell us what you’re trying to solve', 'Share your goal, challenge, or early-stage idea.'],
                ['02', 'Shape the best next step', 'We’ll discuss scope, options, and the right people or services.'],
                ['03', 'Build, learn, or improve', 'Move forward with a service booking, training, or a project plan.'],
              ].map(([number, title, description]) => <div key={number} className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-md"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102638] text-sm font-black text-teal-300 transition group-hover:rotate-6">{number}</span><span><span className="block font-bold text-slate-950">{title}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{description}</span></span></div>)}
            </div>
            <div className="mt-7 flex flex-wrap gap-3"><Link href={`/${locale}/services`} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#102638] px-5 font-bold text-white transition hover:bg-teal-800">Book a consultation <ArrowRight className="h-4 w-4" /></Link><Link href="#share-idea" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 px-5 font-bold text-slate-800 transition hover:border-teal-600 hover:text-teal-900"><Lightbulb className="h-4 w-4" /> Share your idea</Link></div>
          </HubReveal>
        </div>
      </section>

      <section id="vms" className="relative isolate scroll-mt-24 overflow-hidden bg-[#091925] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-10">
        <div aria-hidden="true" className="absolute -right-20 top-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_.9fr]">
          <HubReveal>
            <SectionHeading kicker="Separate ARTIC product" title="ARTIC VMS. Fleet operations in their own workspace." text="Open ARTIC Vehicle Monitoring System to explore its services, register a personal or company account, or sign in. VMS has its own registration and sign-in; ARTIC HUB does not collect VMS credentials." light />
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="https://articvms.ddnsgeek.com" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-300 px-5 font-bold text-slate-950 transition hover:bg-blue-200">Open VMS <ArrowUpRight className="h-4 w-4" /></a>
              <a href="https://articvms.ddnsgeek.com/register?type=personal" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 px-5 font-semibold text-white transition hover:bg-white/10">Personal registration</a>
              <a href="https://articvms.ddnsgeek.com/register?type=company" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 px-5 font-semibold text-white transition hover:bg-white/10">Company registration</a>
            </div>
            <a href="https://articvms.ddnsgeek.com/login" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-200 underline underline-offset-4 hover:text-white">Already have a VMS account? Sign in there <ArrowUpRight className="h-3.5 w-3.5" /></a>
          </HubReveal>
          <HubReveal delay={100} className="relative">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-900/70 p-3 shadow-2xl sm:p-5">
              <Image src={offerings[3].image} alt="Vehicle on a road, representing fleet operations" width={1000} height={680} sizes="(max-width: 1024px) 100vw, 45vw" unoptimized className="h-[300px] w-full rounded-2xl object-cover opacity-80 sm:h-[390px]" />
              <div className="absolute inset-x-8 bottom-8 rounded-xl border border-white/20 bg-slate-950/80 px-4 py-3 backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-blue-200">ARTIC VMS</p><p className="mt-1 text-xs text-white">Separate product · separate sign-in</p></div>
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-400">Product photograph only. This is not live VMS data or a dashboard preview.</p>
          </HubReveal>
        </div>
      </section>

      <section id="academy" className="relative isolate scroll-mt-24 overflow-hidden bg-[#102638] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-10">
        <div aria-hidden="true" className="absolute -right-40 top-0 -z-10 h-[34rem] w-[34rem] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <HubReveal>
            <SectionHeading kicker="Learning that moves with you" title="Build skills you can put to work." text="Explore ARTIC Academy for practical learning and training registration. Start as an individual or bring a programme to your team." light />
            <div className="mt-8 flex flex-wrap gap-3"><Link href={`/${locale}/academy`} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-teal-400 px-5 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-300">Explore Academy <ArrowRight className="h-4 w-4" /></Link><Link href={`/${locale}/academy/training-registration`} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 px-5 font-bold text-white transition hover:bg-white/10">Register for training</Link></div>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-300"><BookOpen className="h-5 w-5 text-teal-300" /> Courses · Team training · Skills development</div>
          </HubReveal>
          <HubReveal delay={100} className="relative">
            <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 sm:min-h-[490px]">
              <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=75" alt="A group of learners sharing knowledge around a laptop" fill sizes="(max-width: 1024px) 100vw, 55vw" unoptimized className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1724]/70 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">Learn by doing</p><p className="mt-1 text-2xl font-black">A stronger skillset starts here.</p></div><span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-teal-900"><GraduationCap className="h-6 w-6" /></span></div>
            </div>
          </HubReveal>
        </div>
      </section>

      <section id="marketplace" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <HubReveal><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><SectionHeading kicker="Shop ARTIC HUB" title="Find something useful for what’s next." text="Explore product categories, featured items, and current offers from the marketplace." /><Link href={`/${locale}/search`} className="inline-flex shrink-0 items-center gap-2 font-bold text-teal-900 hover:text-teal-700">Go to marketplace <ArrowRight className="h-4 w-4" /></Link></div></HubReveal>
          <div className="mt-9"><Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-slate-100" />}><CategoryGrid /></Suspense></div>
          <div className="mt-14 space-y-14">
            <Suspense fallback={<ProductGridSkeleton count={4} />}><FeaturedProducts /></Suspense>
            <Suspense fallback={null}><ServicesStrip /></Suspense>
            <Suspense fallback={<ProductGridSkeleton count={4} />}><DealsSection /></Suspense>
            <Suspense fallback={<ProductGridSkeleton count={4} />}><TrendingSection /></Suspense>
          </div>
        </div>
      </section>

      <DestinationDirectory locale={locale} />

      <section id="share-idea" className="scroll-mt-24 bg-[#f3f7f7] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <HubReveal className="lg:sticky lg:top-28">
            <SectionHeading kicker="Shape what comes next" title="Your idea could become the next ARTIC service." text="Tell us what people need, what’s missing, or what you’d like to build with ARTIC. Our team reviews every suggestion and follows up when a conversation can move it forward." />
            <div className="mt-7 flex items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><Lightbulb className="h-6 w-6" /></span><p className="text-sm leading-6 text-slate-600">You don’t need a finished business plan. A clear problem and the people it could help are a great start.</p></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">{[['Listen', 'We learn the problem'], ['Explore', 'We shape the opportunity'], ['Build', 'We plan a practical next step']].map(([title, text]) => <div key={title} className="flex items-center gap-3 text-sm"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-900"><Check className="h-4 w-4" /></span><span><strong>{title}</strong><span className="ml-2 text-slate-500">{text}</span></span></div>)}</div>
          </HubReveal>
          <HubReveal delay={100}><IdeaSubmissionForm /></HubReveal>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-slate-950 px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-10">
        <Image src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1500&q=65" alt="People collaborating to develop a project" fill sizes="100vw" unoptimized className="-z-20 object-cover opacity-25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-[#102638]/85" />
        <HubReveal className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div><SectionHeading kicker="Let’s connect" title="A question, a project, or a service to book?" text="Tell us what you need. We’ll help you find the right next step with ARTIC Group Ltd." light /><div className="mt-8 flex flex-wrap gap-3"><Link href={`/${locale}/customer-service`} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-teal-400 px-5 font-bold text-slate-950 transition hover:bg-teal-300"><Headphones className="h-4 w-4" /> Contact ARTIC</Link><Link href={`/${locale}/services`} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/30 px-5 font-bold text-white transition hover:bg-white/10"><CalendarDays className="h-4 w-4" /> Browse & book services</Link></div></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{[
            { icon: Mail, label: 'Email our team', value: 'articltd1@gmail.com', href: 'mailto:articltd1@gmail.com' },
            { icon: Phone, label: 'Call ARTIC', value: '+250 787 585 826', href: 'tel:+250787585826' },
            { icon: MapPin, label: 'Based in', value: 'Kigali, Rwanda', href: `/${locale}/customer-service` },
          ].map(({ icon: Icon, label, value, href }) => <a key={label} href={href} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur transition hover:border-teal-300/40 hover:bg-white/10"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-teal-200 transition group-hover:bg-teal-300 group-hover:text-slate-950"><Icon className="h-5 w-5" /></span><span><span className="block text-xs text-slate-400">{label}</span><span className="mt-1 block font-semibold text-white">{value}</span></span><ArrowUpRight className="ml-auto h-4 w-4 text-slate-500 transition group-hover:text-teal-200" /></a>)}</div>
        </HubReveal>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10"><Suspense fallback={null}><BrowsingHistorySection /></Suspense></div>

      <HomeQuickNav locale={locale} />
    </main>
  );
}
