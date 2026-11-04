'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, Users } from 'lucide-react';
import { get } from '@/lib/api';

interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  level: string;
  durationHours: number;
  price: string | number;
  currency: string;
  thumbnailUrl?: string | null;
  instructorName?: string | null;
  isFeatured: boolean;
  _count: { modules: number; enrollments: number };
}

const benefits = [
  { icon: BookOpen, title: 'Learn at your pace', text: 'Build practical skills with structured lessons and clear learning paths.' },
  { icon: BriefcaseBusiness, title: 'Skills for real work', text: 'Explore technology, business, and professional development training.' },
  { icon: Users, title: 'Training for teams', text: 'Register individuals or ask ARTIC about a tailored group programme.' },
];

export default function AcademyPage() {
  const locale = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: ['academy', 'courses'],
    queryFn: () => get<Course[]>('/academy/courses'),
    staleTime: 5 * 60 * 1000,
  });
  const courses = data?.data ?? [];

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <section className="relative overflow-hidden bg-[#1A2332] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.3fr_0.7fr] md:items-center md:px-8 md:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-teal-200">
              <GraduationCap className="h-4 w-4" /> ARTIC Academy
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">Learn practical skills. Put them to work.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Discover online courses and instructor-led training from ARTIC. Learn individually or register your team for a programme.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#courses" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0F7A70] px-6 font-bold text-white hover:bg-[#0B625A]">
                Explore courses <ArrowRight className="h-4 w-4" />
              </a>
              <Link href={`/${locale}/academy/training-registration`} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 px-6 font-semibold hover:bg-white/10">
                Register for training
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">A learning space for</p>
            <ul className="mt-5 space-y-4 text-slate-100">
              {['Learners building new skills', 'Professionals advancing their careers', 'Organizations training their teams'].map((item) => (
                <li key={item} className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-[#18A89A]" />{item}</li>
              ))}
            </ul>
            <p className="mt-7 border-t border-white/10 pt-5 text-sm leading-6 text-slate-400">Course enrolment, progress tracking, assessments, and certificates will be available as Academy modules are released.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 md:grid-cols-3 md:px-8">
        {benefits.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-2xl border bg-white p-6 shadow-sm">
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#0F7A70]"><Icon className="h-5 w-5" /></span>
            <h2 className="text-lg font-bold text-[#1A2332]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </section>

      <section id="courses" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold uppercase tracking-widest text-[#0F7A70]">ARTIC Academy</p><h2 className="mt-1 text-3xl font-black text-[#1A2332]">Explore courses</h2></div>
          <Link href={`/${locale}/academy/training-registration`} className="font-semibold text-[#0F7A70] hover:underline">Need a team programme? Register your interest →</Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl bg-white" />)}</div>
        ) : courses.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <article key={course.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                {course.thumbnailUrl ? <Image src={course.thumbnailUrl} alt="" width={960} height={540} unoptimized className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#1A2332] to-[#18A89A] text-white"><GraduationCap className="h-12 w-12 opacity-80" /></div>}
                <div className="p-5">
                  <div className="flex justify-between gap-3 text-xs font-bold uppercase tracking-wide text-[#0F7A70]"><span>{course.category}</span><span>{course.level}</span></div>
                  <h3 className="mt-3 text-xl font-bold text-[#1A2332]">{course.title}</h3>
                  <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">{course.summary}</p>
                  <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-slate-600">
                    <span>{course.durationHours} hours · {course._count.modules} modules</span>
                    <strong className="text-[#1A2332]">{Number(course.price) === 0 ? 'Free' : `${course.currency} ${course.price}`}</strong>
                  </div>
                  <Link href={`/${locale}/academy/training-registration?course=${encodeURIComponent(course.id)}`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A2332] px-4 py-3 font-semibold text-white hover:bg-[#243044]">Register interest <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center md:p-12">
            <GraduationCap className="mx-auto h-10 w-10 text-[#18A89A]" />
            <h3 className="mt-4 text-xl font-bold text-[#1A2332]">Course catalogue is being prepared</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Register your interest in ARTIC training and we’ll contact you about upcoming classes and team programmes.</p>
            <Link href={`/${locale}/academy/training-registration`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0F7A70] px-5 font-bold text-white hover:bg-[#0B625A]">Register for training</Link>
          </div>
        )}
      </section>
    </div>
  );
}
