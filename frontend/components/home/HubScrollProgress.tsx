'use client';

import { motion, useScroll, useSpring } from 'motion/react';

export default function HubScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });

  return <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 right-0 top-0 z-[90] h-[2px] origin-left bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300" style={{ scaleX }} />;
}
