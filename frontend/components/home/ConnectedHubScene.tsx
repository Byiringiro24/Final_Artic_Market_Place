'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, BookOpen, Building2, CarFront, Cpu, GraduationCap, Wrench } from 'lucide-react';

const SERVICE_NODES = [
  { key: 'explore', title: 'Explore', detail: 'ARTIC services', href: '#service-portfolio', x: '18%', y: '18%', color: 'amber', Icon: Building2 },
  { key: 'academy', title: 'Learn', detail: 'Courses & training', href: '#academy', x: '82%', y: '18%', color: 'violet', Icon: GraduationCap },
  { key: 'engineering', title: 'Build', detail: 'Engineering & services', href: '#engineering', x: '18%', y: '82%', color: 'teal', Icon: Wrench },
  { key: 'vms', title: 'Track', detail: 'ARTIC VMS · separate sign-in', href: 'https://articvms.ddnsgeek.com', x: '82%', y: '82%', color: 'blue', Icon: CarFront, external: true },
];

const colorClasses: Record<string, string> = {
  amber: 'text-amber-300 border-amber-300/35 bg-amber-300/10',
  violet: 'text-violet-200 border-violet-300/35 bg-violet-300/10',
  teal: 'text-teal-200 border-teal-300/35 bg-teal-300/10',
  blue: 'text-blue-200 border-blue-300/35 bg-blue-300/10',
};

export default function ConnectedHubScene({ pauseMotion = false }: { pauseMotion?: boolean }) {
  const reduceMotion = useReducedMotion();
  const motionEnabled = !reduceMotion && !pauseMotion;
  const [active, setActive] = useState('hub');

  const diagram = (
    <svg viewBox="0 0 600 390" className="absolute inset-0 h-full w-full" role="img" aria-label="Illustration of ARTIC HUB connecting ARTIC services, learning, engineering, and ARTIC VMS">
      <defs>
        <radialGradient id="hubCore"><stop stopColor="#8ef8e7" stopOpacity=".38" /><stop offset="1" stopColor="#8ef8e7" stopOpacity="0" /></radialGradient>
        <linearGradient id="hubLine"><stop stopColor="#38d8c1" stopOpacity=".08" /><stop offset=".5" stopColor="#a5f3fc" stopOpacity=".72" /><stop offset="1" stopColor="#38d8c1" stopOpacity=".12" /></linearGradient>
      </defs>
      <circle cx="300" cy="195" r="125" fill="url(#hubCore)" />
      {[
        'M300 195 C240 150 180 100 105 65',
        'M300 195 C370 145 420 100 500 65',
        'M300 195 C220 245 165 290 105 330',
        'M300 195 C385 250 435 290 500 330',
      ].map((path, index) => (
        <g key={path}>
          <motion.path d={path} fill="none" stroke="url(#hubLine)" strokeWidth="1.5" initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduceMotion ? 0 : 1.1, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }} />
          {motionEnabled && <motion.circle r="3" fill="#8ef8e7" filter="drop-shadow(0 0 6px #8ef8e7)" animate={index < 2 ? { cx: [300, index === 0 ? 105 : 500], cy: [195, 65] } : { cx: [300, index === 2 ? 105 : 500], cy: [195, 330] }} transition={{ duration: 2.6, delay: index * 0.4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />}
        </g>
      ))}
      <motion.circle cx="300" cy="195" r="58" fill="none" stroke="#5eead4" strokeOpacity=".23" strokeWidth="1" animate={motionEnabled ? { scale: [1, 1.16, 1], opacity: [0.3, 0.7, 0.3] } : { scale: 1, opacity: 0.45 }} transition={{ duration: 3, repeat: motionEnabled ? Infinity : 0, ease: 'easeInOut' }} style={{ transformOrigin: '300px 195px' }} />
      <circle cx="300" cy="195" r="42" fill="#0e2b3b" stroke="#6ee7d3" strokeOpacity=".8" strokeWidth="1.5" />
      <foreignObject x="277" y="170" width="46" height="50"><div className="flex h-full w-full items-center justify-center text-teal-200"><Cpu size="28" /></div></foreignObject>
    </svg>
  );

  return (
    <div className="relative mx-auto h-[230px] w-full max-w-[610px] sm:h-[400px]" onMouseLeave={() => setActive('hub')}>
      <div aria-hidden="true" className="absolute inset-8 rounded-full bg-teal-400/10 blur-[80px]" />
      {diagram}
      {SERVICE_NODES.map(({ key, title, detail, href, x, y, color, Icon, external }) => {
        const classes = `flex w-[132px] min-h-16 items-center gap-2 rounded-2xl border px-2.5 py-2 text-left shadow-xl backdrop-blur-xl transition sm:w-[158px] sm:gap-3 sm:p-3 ${colorClasses[color]} ${active === key ? 'bg-slate-900/90 shadow-[0_0_30px_rgba(94,234,212,0.18)]' : 'bg-slate-950/55 hover:bg-slate-900/80'}`;
        const content = <><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10"><Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /></span><span className="min-w-0"><span className="flex items-center gap-1 text-xs font-bold text-white sm:text-sm">{title}{external && <ArrowUpRight className="h-3 w-3" />}</span><span className="mt-0.5 block truncate text-[9px] leading-4 text-slate-300 sm:text-[10px]">{detail}</span></span></>;
        return external ? (
          <div key={key} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}><motion.a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${title}: ${detail}, opens ARTIC VMS in a new site`} className={classes} onHoverStart={() => setActive(key)} onFocus={() => setActive(key)} whileHover={reduceMotion ? undefined : { y: -5 }} whileTap={{ scale: 0.98 }} initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: active === key ? 1.04 : 1 }} transition={{ duration: 0.45, delay: key === 'shop' ? 0.25 : 0.4 }}>{content}</motion.a></div>
        ) : (
          <div key={key} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}><motion.a href={href} className={classes} onHoverStart={() => setActive(key)} onFocus={() => setActive(key)} whileHover={reduceMotion ? undefined : { y: -5 }} whileTap={{ scale: 0.98 }} initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: active === key ? 1.04 : 1 }} transition={{ duration: 0.45, delay: key === 'explore' ? 0.25 : 0.4 }}>{content}</motion.a></div>
        );
      })}
      <motion.div className="absolute left-1/2 top-1/2 z-10 w-[150px] -translate-x-1/2 -translate-y-1/2 text-center" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} aria-live="polite">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#0c1c2a]/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.15em] text-teal-100 shadow-xl sm:text-[10px]"><BookOpen className="h-3 w-3" /> ARTIC {active === 'hub' ? 'HUB' : active.toUpperCase()}</span>
      </motion.div>
    </div>
  );
}
