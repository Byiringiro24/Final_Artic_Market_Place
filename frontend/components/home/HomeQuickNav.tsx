'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { GraduationCap, ShoppingBag, UserRound, Wrench } from 'lucide-react';

export default function HomeQuickNav({ locale }: { locale: string }) {
  const [footerVisible, setFooterVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0.02 });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {!footerVisible && <motion.nav aria-label="Quick navigation" initial={reduceMotion ? false : { y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduceMotion ? undefined : { y: 24, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.22 }} className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-lg lg:hidden">
        {[
          { label: 'Shop', href: `/${locale}/search`, icon: ShoppingBag },
          { label: 'Academy', href: `/${locale}/academy`, icon: GraduationCap },
          { label: 'Services', href: `/${locale}/services`, icon: Wrench },
          { label: 'Account', href: `/${locale}/account`, icon: UserRound },
        ].map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold text-slate-600 transition hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"><Icon className="h-4 w-4" aria-hidden="true" />{label}</Link>)}
      </motion.nav>}
    </AnimatePresence>
  );
}
