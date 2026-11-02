'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUpRight, CalendarDays, Pause, Play, Sparkles } from 'lucide-react';
import ConnectedHubScene from '@/components/home/ConnectedHubScene';

const VERBS = ['Learn', 'Build', 'Buy', 'Track'];

export default function HubHero({ locale }: { locale: string }) {
  const reduceMotion = useReducedMotion();
  const [verbIndex, setVerbIndex] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || motionPaused) return;
    const timer = window.setInterval(() => setVerbIndex((index) => (index + 1) % VERBS.length), 2600);
    return () => window.clearInterval(timer);
  }, [reduceMotion, motionPaused]);

  return (
    <section className="relative isolate min-h-[760px] overflow-hidden bg-[#081521] text-white lg:min-h-[690px]">
      <Image
        src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1600&q=70"
        alt="Technical workbench in a bright engineering environment"
        fill priority sizes="100vw" unoptimized className="-z-20 object-cover object-center opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_45%,rgba(14,116,144,.23),transparent_46%),linear-gradient(105deg,#081521_12%,rgba(8,21,33,.97)_39%,rgba(8,21,33,.7)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(148,213,222,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,213,222,.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_94%)]" />

      <div className="mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-2 px-5 pb-12 pt-10 sm:px-8 lg:min-h-[690px] lg:grid-cols-[.9fr_1.1fr] lg:px-12">
        <div className="relative z-20 max-w-2xl pt-8 lg:pt-0">
          <motion.p initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="inline-flex items-center gap-2 rounded-full border border-teal-100/20 bg-teal-300/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.19em] text-teal-100 sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-300" /> ARTIC Group Ltd <span className="text-teal-300/60">/</span> Engineering · Technology · Innovation
          </motion.p>
          <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="mt-7 text-[3.4rem] font-black leading-[.95] tracking-[-.055em] sm:text-7xl xl:text-[5.4rem]">
            One ARTIC.<br />
            <span className="relative inline-block min-w-[5ch] text-teal-300">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={VERBS[verbIndex]} className="inline-block" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -16 }} transition={{ duration: reduceMotion ? 0 : 0.32 }}>{VERBS[verbIndex]}.</motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>
          <motion.p initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }} className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
            ARTIC Group brings together a marketplace, practical training, engineering and IoT services, and fleet monitoring—so you can find the right next step in one place.
          </motion.p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#choose-path" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 font-bold text-[#081521] shadow-lg shadow-teal-950/40 transition hover:-translate-y-0.5 hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Explore ARTIC services <ArrowDown className="h-4 w-4" /></Link>
            <a href="https://articvms.ddnsgeek.com" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 font-bold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200">Open ARTIC VMS <ArrowUpRight className="h-4 w-4" /></a>
          </div>
          <Link href="#how-it-works" className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white">See how ARTIC HUB connects <ArrowDown className="h-3.5 w-3.5" /></Link>
          <Link href={`/${locale}/services`} className="ml-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-teal-200 underline decoration-teal-200/40 underline-offset-4 transition hover:text-white"><CalendarDays className="h-3.5 w-3.5" /> Request a service</Link>
          <p className="mt-5 text-[11px] text-slate-400">ARTIC VMS opens separately and uses its own sign-in.</p>
          <div className="mt-8 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-300 sm:text-xs"><span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5">IoT</span><span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5">Embedded</span><span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5">Academy</span><span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5">Marketplace</span></div>
        </div>
        <div className="relative -mx-3 mt-0 sm:mx-0 lg:ml-0 lg:mt-0">
          <ConnectedHubScene pauseMotion={motionPaused} />
          <p className="mx-auto -mt-4 max-w-sm text-center text-[10px] font-medium uppercase tracking-[.18em] text-slate-400 sm:mt-0">The Living Hub · choose a node to explore</p>
          <div className="mt-3 flex justify-center">
            <button type="button" onClick={() => setMotionPaused((paused) => !paused)} disabled={Boolean(reduceMotion)} aria-label={motionPaused ? 'Play hero animations' : 'Pause hero animations'} aria-pressed={motionPaused || Boolean(reduceMotion)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-[10px] font-semibold text-slate-300 transition hover:border-teal-300/50 hover:text-white disabled:cursor-default disabled:opacity-60">
              {reduceMotion ? <Play className="h-3 w-3" /> : motionPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              {reduceMotion ? 'Motion reduced' : motionPaused ? 'Play animation' : 'Pause animation'}
            </button>
          </div>
        </div>
      </div>
      <a href="#trust" aria-label="Scroll down" className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center justify-center rounded-full border border-white/20 p-2.5 text-white/70 transition hover:text-white md:flex"><ArrowDown className="h-4 w-4" /></a>
    </section>
  );
}
