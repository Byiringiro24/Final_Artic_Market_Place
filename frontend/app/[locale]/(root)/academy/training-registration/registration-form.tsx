'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';
import { get, post } from '@/lib/api';

interface CourseOption { id: string; title: string }
interface RegistrationResult { id: string; courseTitle: string; status: string }

export default function TrainingRegistrationForm({ courseId }: { courseId?: string }) {
  const locale = useLocale();
  const { data } = useQuery({ queryKey: ['academy', 'registration-courses'], queryFn: () => get<CourseOption[]>('/academy/courses') });
  const courses = data?.data ?? [];
  const [selectedCourse, setSelectedCourse] = useState(courseId ?? '');
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RegistrationResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitting(true);
    setError('');
    const form = new FormData(formElement);
    const selected = courses.find((course) => course.id === selectedCourse);
    const courseTitle = selected?.title || String(form.get('courseTitle') || 'General ARTIC training');
    try {
      const response = await post<RegistrationResult>('/academy/training-registrations', {
        courseId: selected?.id,
        courseTitle,
        fullName: form.get('fullName'),
        email: form.get('email'),
        phone: form.get('phone'),
        organization: form.get('organization'),
        message: form.get('message'),
        whatsappOptIn,
        consent: form.get('consent') === 'on',
      });
      setResult(response.data);
      formElement.reset();
      setSelectedCourse('');
      setWhatsappOptIn(false);
    } catch {
      setError('We could not submit your registration. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[75vh] bg-[#F0F4F8] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-2xl">
        <Link href={`/${locale}/academy`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0F7A70] hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Academy</Link>
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-9">
          <div className="mb-7 flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0F7A70]"><GraduationCap /></span><div><p className="text-xs font-bold uppercase tracking-widest text-[#0F7A70]">ARTIC Academy</p><h1 className="mt-1 text-3xl font-black text-[#1A2332]">Training registration</h1><p className="mt-2 text-sm leading-6 text-slate-600">Tell us what training you’re interested in. ARTIC will follow up with programme and schedule details.</p></div></div>

          {result ? (
            <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" /><h2 className="mt-3 text-xl font-bold text-emerald-900">Registration received</h2><p className="mt-2 text-sm text-emerald-800">We’ve recorded your interest in <strong>{result.courseTitle}</strong>. Our team will contact you using the details you provided.</p><button type="button" onClick={() => setResult(null)} className="mt-5 font-semibold text-emerald-900 underline">Register another person</button></div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label htmlFor="courseId" className="mb-1.5 block text-sm font-semibold text-slate-700">Training programme</label><select id="courseId" value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#18A89A] focus:ring-2 focus:ring-teal-100"><option value="">General training interest / not listed</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select>{!selectedCourse && <input name="courseTitle" aria-label="Training topic" placeholder="Training topic or skill area (optional)" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#18A89A]" />}</div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-slate-700">Full name *</label><input id="fullName" name="fullName" required minLength={2} maxLength={120} autoComplete="name" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#18A89A]" /></div><div><label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-700">Phone number *</label><input id="phone" name="phone" type="tel" required minLength={7} maxLength={30} autoComplete="tel" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#18A89A]" /></div></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email address *</label><input id="email" name="email" type="email" required maxLength={254} autoComplete="email" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#18A89A]" /></div><div><label htmlFor="organization" className="mb-1.5 block text-sm font-semibold text-slate-700">Organization</label><input id="organization" name="organization" maxLength={160} autoComplete="organization" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#18A89A]" /></div></div>
              <div><label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-slate-700">Additional details</label><textarea id="message" name="message" rows={3} maxLength={2000} placeholder="Tell us about your goals, preferred dates, or team size." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#18A89A]" /></div>
              <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm leading-5 text-slate-700"><input name="consent" type="checkbox" required className="mt-1 accent-[#18A89A]" /><span>I agree that ARTIC may use these details to respond to my training enquiry and manage this registration. *</span></label>
              <label className="flex items-start gap-3 text-sm leading-5 text-slate-600"><input type="checkbox" checked={whatsappOptIn} onChange={(event) => setWhatsappOptIn(event.target.checked)} className="mt-1 accent-[#18A89A]" /><span>Optionally, send me course updates and community invitations through WhatsApp. I can opt out later.</span></label>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={submitting} className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#18A89A] px-5 font-bold text-white hover:bg-[#0F7A70] disabled:cursor-wait disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit registration'}</button>
              <p className="text-center text-xs text-slate-500">WhatsApp contact is optional. Registration does not add you to a group automatically.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
