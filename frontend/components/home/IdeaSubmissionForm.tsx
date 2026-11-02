'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Lightbulb, LoaderCircle } from 'lucide-react';
import { post } from '@/lib/api';

export default function IdeaSubmissionForm() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await post('/ideas', {
        name: formData.get('name'),
        email: formData.get('email'),
        category: formData.get('category'),
        idea: formData.get('idea'),
        website: formData.get('website'),
      });
      form.reset();
      setSubmitted(true);
    } catch {
      setError('We could not send your idea right now. Please try again or contact our team directly.');
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-emerald-950" role="status">
        <CheckCircle2 className="h-9 w-9 text-emerald-700" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold">Your idea is with our team.</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-900">Thank you for helping shape what ARTIC builds next. We’ll review your suggestion and follow up by email if we need more detail.</p>
        <button type="button" className="mt-5 font-semibold underline underline-offset-4" onClick={() => setSubmitted(false)}>Share another idea</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl border border-white/10 bg-white p-5 shadow-2xl sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><Lightbulb className="h-5 w-5" aria-hidden="true" /></span>
        <div><h3 className="font-bold text-slate-950">Tell us what we should build</h3><p className="text-xs text-slate-500">Ideas, improvements, and partnership proposals welcome.</p></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Your name
          <input name="name" required maxLength={100} autoComplete="name" className="min-h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" placeholder="Name" />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Email address
          <input name="email" type="email" required maxLength={254} autoComplete="email" className="min-h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" placeholder="you@example.com" />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-semibold text-slate-700">What is your idea about?
        <select name="category" defaultValue="new-service" className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15">
          <option value="new-service">A new service</option><option value="platform-improvement">Improving ARTIC HUB</option><option value="partnership">Partnership</option><option value="other">Something else</option>
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Describe it
        <textarea name="idea" required minLength={10} maxLength={3000} rows={4} className="resize-y rounded-xl border border-slate-200 px-3 py-2 font-normal leading-6 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" placeholder="What problem could it solve? Who would benefit?" />
      </label>

      <label aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden">Leave this field empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}
      <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#102638] px-5 font-bold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        {pending ? 'Sending idea…' : 'Send your idea'}
      </button>
      <p className="text-[11px] leading-5 text-slate-500">By submitting, you agree that ARTIC may contact you about this suggestion. Please don’t include passwords or sensitive personal information.</p>
    </form>
  );
}
