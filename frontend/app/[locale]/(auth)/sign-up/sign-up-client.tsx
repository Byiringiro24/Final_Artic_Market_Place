"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import SignUpForm from './sign-up-form';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

function AnimatedHeadline({ words = [], interval = 3000 }: { words: string[]; interval?: number }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval, reduced]);

  return (
    <div className="relative inline-block">
      <span className="text-3xl md:text-4xl font-extrabold leading-tight">Join the ARTIC ecosystem</span>
      <div className="mt-3 text-lg md:text-xl text-gray-600">
        <span className="mr-2">We</span>
        <span aria-live="polite" className="inline-block font-semibold text-artic-primary">
          {words[index]}
        </span>
        <span className="ml-2 text-sm text-gray-500">— Build · Connect · Innovate</span>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const rotating = useMemo(
    () => ['ENGINEER', 'DESIGN', 'BUILD', 'CONNECT', 'INNOVATE', 'AUTOMATE'],
    []
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-artic-light p-6">
      <div className="w-full max-w-6xl bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Brand / marketing panel */}
          <aside className="p-8 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
            <div className="flex flex-col gap-6">
              <div>
                <AnimatedHeadline words={rotating} interval={2800} />
                <p className="mt-4 text-gray-700">
                  ARTIC Group Ltd helps teams ship hardware and software together — from electronics
                  to IoT and automation. Create an account to manage products, request services, and
                  join our partner network.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border w-32 h-20 flex items-center justify-center text-center">
                  <div>
                    <div className="text-sm font-medium">Electronics</div>
                    <div className="text-xs text-gray-500">PCBs, Sensors</div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border w-32 h-20 flex items-center justify-center text-center">
                  <div>
                    <div className="text-sm font-medium">Software</div>
                    <div className="text-xs text-gray-500">Cloud & Mobile</div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border w-32 h-20 flex items-center justify-center text-center">
                  <div>
                    <div className="text-sm font-medium">IoT</div>
                    <div className="text-xs text-gray-500">Connectivity</div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Trusted by engineers, makers and businesses across the region.
              </div>
            </div>
          </aside>

          {/* Right: Form panel */}
          <section className="flex items-center justify-center">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-medium mb-1">Create account</h1>
              <p className="text-sm text-gray-600 mb-5">
                Already have an account?{' '}
                <a href="./sign-in" className="text-artic-link hover:underline">
                  Sign in
                </a>
              </p>

              <div className="mb-4">
                <GoogleSignInButton label="Sign up with Google" />
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or register manually</span>
                </div>
              </div>

              <SignUpForm />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
