import Link from 'next/link';
import {
  ArrowUpRight, BookOpen, Briefcase, Building2, CalendarDays,
  Car, Download, GraduationCap, Headphones, HeartPulse, Leaf,
  ShoppingBag, Store, UsersRound, Wrench, Cpu,
} from 'lucide-react';

type ServiceLink = {
  name: string;
  description: string;
  href: string;
  icon: typeof ShoppingBag;
  accent: string;
  external?: boolean;
};

const AVAILABLE_SERVICES: ServiceLink[] = [
  {
    name: 'Marketplace',
    description: 'Discover products, offers, and trusted sellers.',
    href: '/search',
    icon: ShoppingBag,
    accent: 'bg-orange-50 text-orange-700 ring-orange-100',
  },
  {
    name: 'ARTIC Academy',
    description: 'Explore practical courses and professional training.',
    href: '/academy',
    icon: GraduationCap,
    accent: 'bg-violet-50 text-violet-700 ring-violet-100',
  },
  {
    name: 'Training registration',
    description: 'Register your interest in upcoming training programs.',
    href: '/academy/training-registration',
    icon: BookOpen,
    accent: 'bg-blue-50 text-blue-700 ring-blue-100',
  },
  {
    name: 'Professional services',
    description: 'Browse services and request a booking or consultation.',
    href: '/services',
    icon: Wrench,
    accent: 'bg-teal-50 text-teal-700 ring-teal-100',
  },
  {
    name: 'Sell on ARTIC HUB',
    description: 'Apply to list products and grow your customer reach.',
    href: '/sell',
    icon: Store,
    accent: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  {
    name: 'Customer support',
    description: 'Get help with orders, accounts, and platform services.',
    href: '/customer-service',
    icon: Headphones,
    accent: 'bg-sky-50 text-sky-700 ring-sky-100',
  },
  {
    name: 'ARTIC VMS',
    description: 'Open the ARTIC Vehicle Monitoring System.',
    href: 'https://articvms.ddnsgeek.com',
    icon: Car,
    accent: 'bg-slate-100 text-slate-700 ring-slate-200',
    external: true,
  },
];

const PLANNED_SERVICES = [
  { name: 'Business directory', description: 'Find local companies and professionals.', icon: Building2 },
  { name: 'Jobs & opportunities', description: 'Explore jobs, internships, and projects.', icon: Briefcase },
  { name: 'Events & webinars', description: 'Discover workshops, webinars, and meetups.', icon: CalendarDays },
  { name: 'Digital products', description: 'Download guides, templates, and learning resources.', icon: Download },
  { name: 'Memberships', description: 'Access member benefits and curated resources.', icon: UsersRound },
  { name: 'AI & automation', description: 'Get help bringing practical AI into your workflows.', icon: Cpu },
  { name: 'Digital health', description: 'Explore future health tracking and monitoring tools.', icon: HeartPulse },
  { name: 'Agriculture & IoT', description: 'Discover connected tools for farms and field teams.', icon: Leaf },
];

function ServiceCard({ service, locale }: { service: ServiceLink; locale: string }) {
  const Icon = service.icon;
  const card = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${service.accent}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-700" aria-hidden="true" />
      </div>
      <div className="mt-5">
        <h3 className="font-bold text-slate-900">{service.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-800">
        Open service <span aria-hidden="true">→</span>
      </span>
    </>
  );

  const className = 'group flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600';

  return service.external ? (
    <a className={className} href={service.href} target="_blank" rel="noopener noreferrer">
      {card}
    </a>
  ) : (
    <Link className={className} href={`/${locale}${service.href}`}>
      {card}
    </Link>
  );
}

export default function HubServiceDirectory({ locale }: { locale: string }) {
  return (
    <section id="hub-services" className="scroll-mt-28 bg-[#F4F7FA] px-4 py-14 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Explore ARTIC HUB</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Choose where to go</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Start with a service that fits what you need today. Your ARTIC services are gathered in one place.</p>
          </div>
          <span className="w-fit rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-900">Available now</span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {AVAILABLE_SERVICES.map((service) => (
            <ServiceCard key={service.name} service={service} locale={locale} />
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Growing the hub</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">More services are on the way</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">These areas are planned for future releases. We’ll make them available here as each service is ready.</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PLANNED_SERVICES.map(({ name, description, icon: Icon }) => (
            <article key={name} className="flex min-h-36 gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">{name}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Planned</span>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
