import Link from 'next/link';
import {
  ArrowUpRight, BookOpen, BriefcaseBusiness, Building2, CalendarDays,
  Cpu, GraduationCap, Headphones, HeartPulse, Hotel, Leaf, Radio,
  ShoppingBag, Sparkles, Store, Ticket, Users, Wrench, Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import HubReveal from '@/components/home/HubReveal';

type Service = {
  title: string;
  description: string;
  details: string[];
  status: 'Live' | 'Planned' | 'Separate product';
  href?: string;
  icon: LucideIcon;
};

export default function ServicePortfolio({ locale }: { locale: string }) {
  const services: Service[] = [
    { title: 'Marketplace', description: 'A place to discover products and approved sellers across the ARTIC HUB marketplace.', details: ['Product search and categories', 'Seller storefronts and reviews', 'Orders, delivery, and account tools'], status: 'Live', href: `/${locale}/search`, icon: ShoppingBag },
    { title: 'ARTIC Academy', description: 'Practical learning for individuals, learners, and organizations.', details: ['Course catalog and learning paths', 'Recorded lessons and training registration', 'Quizzes, progress, and certificates as the Academy grows'], status: 'Live', href: `/${locale}/academy`, icon: GraduationCap },
    { title: 'Training & learner community', description: 'A clear route from programme discovery to training registration and follow-up.', details: ['Individual and team programme enquiries', 'Registration and confirmation workflows', 'WhatsApp community invitation after approval'], status: 'Live', href: `/${locale}/academy/training-registration`, icon: Users },
    { title: 'Engineering, electronics & IoT', description: 'Hands-on technical services for ideas that need to become working systems.', details: ['Embedded systems, electronics, and PCB design', 'Networking, sensors, and IoT deployments', 'Mechanical CAD, prototyping, installation, and field support'], status: 'Live', href: `/${locale}/services`, icon: Cpu },
    { title: 'AI integration & digital technology', description: 'Project-based technology support shaped around a real business or engineering need.', details: ['AI workflow and website integration', 'Edge AI and embedded development enquiries', 'Technical research, system design, and implementation planning'], status: 'Live', href: `/${locale}/services`, icon: Workflow },
    { title: 'Professional services & booking', description: 'Explore ARTIC service listings and request a consultation or booking.', details: ['Technical and business service enquiries', 'Provider profiles and booking requests', 'Project scoping and follow-up with the ARTIC team'], status: 'Live', href: `/${locale}/services`, icon: Wrench },
    { title: 'Business directory', description: 'A discovery directory for local businesses and independent professionals.', details: ['Business and professional profiles', 'Search by service, category, and location', 'Service areas, contact details, and moderated reviews'], status: 'Planned', icon: Building2 },
    { title: 'Jobs & opportunities', description: 'A future space connecting employers, candidates, learners, and project teams.', details: ['Jobs, internships, and freelance projects', 'Candidate profiles and applications', 'Employer listings and opportunity alerts'], status: 'Planned', icon: BriefcaseBusiness },
    { title: 'Events & webinars', description: 'Discover practical events and connect them with relevant ARTIC learning and services.', details: ['Event and webinar listings', 'Reservations or ticketing', 'Attendee updates and reminders'], status: 'Planned', icon: CalendarDays },
    { title: 'Digital products & resources', description: 'Downloadable knowledge and tools for learning, business, and technical work.', details: ['Guides, eBooks, and manuals', 'Templates, software, and licensed resources', 'Course materials and digital downloads'], status: 'Planned', icon: BookOpen },
    { title: 'Memberships & subscriptions', description: 'A future subscription layer for ongoing learning and member benefits.', details: ['Course and resource collections', 'Member-only benefits and events', 'Subscription tiers and recurring billing'], status: 'Planned', icon: Ticket },
    { title: 'Seller & service-provider portal', description: 'Tools for approved sellers and providers to manage their ARTIC HUB activity.', details: ['Applications and provider onboarding', 'Listings, orders, and booking management', 'Payouts and performance reporting'], status: 'Live', href: `/${locale}/sell`, icon: Store },
    { title: 'Customer support & platform administration', description: 'Support for customers and operational tools for the ARTIC team.', details: ['Help and customer contact', 'Account, listing, and content administration', 'Training registration review and service operations'], status: 'Live', href: `/${locale}/customer-service`, icon: Headphones },
    { title: 'Hotel management', description: 'A planned operational system for hospitality teams and property operators.', details: ['Rooms, reservations, check-in, and check-out', 'Housekeeping, maintenance, and guest billing', 'Staff roles, occupancy, and revenue reporting'], status: 'Planned', icon: Hotel },
    { title: 'Property & tenant management', description: 'A planned workspace for property portfolios, landlords, and tenants.', details: ['Properties, units, leases, and documents', 'Rent, deposits, utilities, and maintenance requests', 'Tenant portal, notices, and portfolio reporting'], status: 'Planned', icon: Building2 },
    { title: 'Digital health companion', description: 'A separate product concept focused on personal monitoring and alerts.', details: ['Activity, sleep, and supported sensor trends', 'Baseline changes and configurable alerts', 'Privacy-conscious mobile and clinician workflows; not diagnosis'], status: 'Separate product', icon: HeartPulse },
    { title: 'Agricultural IoT', description: 'A separate product concept for connected farm monitoring and field operations.', details: ['Soil and environmental sensor nodes', 'Connectivity, dashboards, and irrigation alerts', 'Future crop, livestock, and farmer workflows'], status: 'Separate product', icon: Leaf },
    { title: 'ARTIC VMS', description: 'ARTIC’s separate vehicle monitoring product, with its own account and sign-in.', details: ['Open the VMS platform', 'Register personal or company account', 'Sign in through the VMS service'], status: 'Separate product', href: 'https://articvms.ddnsgeek.com', icon: Radio },
  ];

  const statusStyle: Record<Service['status'], string> = {
    Live: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Planned: 'border-amber-200 bg-amber-50 text-amber-900',
    'Separate product': 'border-blue-200 bg-blue-50 text-blue-900',
  };

  return (
    <section id="service-portfolio" className="scroll-mt-24 bg-[#081521] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <HubReveal>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.22em] text-teal-300">ARTIC Group · service portfolio</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">One platform, a wider service ecosystem.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Explore the services ARTIC HUB connects today and the modules planned for future releases. Marketplace shopping happens in its own destination; this page introduces the full ARTIC portfolio.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-xs font-semibold text-teal-100"><Sparkles className="h-4 w-4" /> 18 service families</span>
          </div>
        </HubReveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map(({ title, description, details, status, href, icon: Icon }, index) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[.06] text-teal-200 transition group-hover:border-teal-200/30 group-hover:bg-teal-300/10"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] ${statusStyle[status]}`}>{status}</span>
                </div>
                <h3 className="mt-5 text-lg font-extrabold tracking-tight text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {details.map((detail) => <li key={detail} className="flex gap-2 text-xs leading-5 text-slate-400"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-300" />{detail}</li>)}
                </ul>
                {href && <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-teal-200">{status === 'Separate product' ? 'Open separate product' : 'Explore this service'} <ArrowUpRight className="h-3.5 w-3.5" /></span>}
              </>
            );
            const className = `group h-full rounded-2xl border border-white/10 bg-white/[.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-teal-200/35 hover:bg-white/[.065] hover:shadow-[0_18px_55px_-30px_rgba(45,212,191,.4)] ${href ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300' : ''}`;
            return <HubReveal key={title} delay={(index % 6) * 45} className="h-full">{href ? (href.startsWith('http') ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a> : <Link href={href} className={className}>{content}</Link>) : <article className={className}>{content}</article>}</HubReveal>;
          })}
        </div>
        <p className="mt-6 text-xs leading-5 text-slate-400">Planned modules are portfolio direction, not currently available pages. Separate product links use their own service and authentication.</p>
      </div>
    </section>
  );
}
