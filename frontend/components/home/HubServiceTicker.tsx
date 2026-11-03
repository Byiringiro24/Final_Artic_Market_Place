'use client';

import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useReducedMotion } from 'motion/react';

const SERVICE_LABELS = ['ARTIC Academy', 'Engineering services', 'Embedded systems', 'Networking & IoT', 'AI integration', 'Business support', 'ARTIC VMS'];

export default function HubServiceTicker() {
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const isPaused = paused || Boolean(reduceMotion);

  return (
    <div id="trust" className="flex items-center gap-4 overflow-hidden border-b border-slate-200 bg-[#f7fafb] py-3 pl-5 pr-3 sm:pl-8 lg:pl-10" aria-label="ARTIC Group services">
      <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400 sm:block">Explore ARTIC</span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="hub-marquee-track gap-7 whitespace-nowrap text-[10px] font-bold uppercase tracking-[.15em] text-slate-600 sm:gap-9 sm:text-xs" style={{ animationPlayState: isPaused ? 'paused' : 'running' }}>
          {[0, 1].map((copy) => <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-7 sm:gap-9">
            {SERVICE_LABELS.map((label) => <span key={label} className="inline-flex items-center gap-7 sm:gap-9">{label}<span className="text-teal-700">✳</span></span>)}
          </div>)}
        </div>
      </div>
      <button type="button" onClick={() => setPaused((value) => !value)} disabled={Boolean(reduceMotion)} aria-label={isPaused ? 'Play service ticker animation' : 'Pause service ticker animation'} aria-pressed={isPaused} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-900 disabled:cursor-default disabled:opacity-60 sm:px-3 sm:text-xs">
        {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{reduceMotion ? 'Motion off' : isPaused ? 'Play' : 'Pause'}</span>
      </button>
    </div>
  );
}
