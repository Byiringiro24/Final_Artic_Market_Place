'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { ShoppingCart, Heart, Bell, Globe } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import MegaNav from './MegaNav';
import SlidingNavBar from './SlidingNavBar';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import CurrencySwitcher from './CurrencySwitcher';

export default function Header() {
  const locale = useLocale();
  const { getTotalItems, openSidebar } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const cartCount = getTotalItems();

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg">
      {/* ── TOP BAR: Logo + Search + Actions ── */}
      <div className="bg-[#1A2332]">
        <div className="max-w-[1600px] mx-auto px-3 h-[60px] flex items-center gap-3">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center flex-shrink-0 mr-2 group" aria-label="ARTIC Group Ltd — Home">
            <Image
              src="/logo.jpg"
              alt="ARTIC Group Ltd"
              width={120}
              height={48}
              className="h-10 w-auto max-w-[120px] object-contain group-hover:brightness-110 transition-all duration-200 logo-mark"
              priority
            />
          </Link>

          {/* Search — takes most space */}
          <div className="flex-1 max-w-3xl">
            <SearchBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {/* Language */}
            <LanguageSwitcher />

            {/* Currency */}
            <CurrencySwitcher />

            {/* Theme */}
            <ThemeSwitcher />

            {/* User account */}
            <UserMenu />

            {/* Wishlist */}
            <Link
              href={`/${locale}/wishlist`}
              className="hidden sm:flex flex-col items-center p-2 text-gray-300 hover:text-[#18A89A] transition-colors group"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              <span className="text-[9px] mt-0.5 hidden lg:block">Wishlist</span>
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                href={`/${locale}/account/notifications`}
                className="hidden sm:flex flex-col items-center p-2 text-gray-300 hover:text-[#18A89A] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="text-[9px] mt-0.5 hidden lg:block">Alerts</span>
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={openSidebar}
              className="flex flex-col items-center p-2 text-gray-300 hover:text-[#18A89A] transition-colors relative"
              aria-label={`Cart with ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2 h-5 min-w-[20px] flex items-center justify-center rounded-full bg-[#18A89A] text-white text-[10px] font-bold px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-0.5 hidden lg:block">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV BAR: Mega menu + sliding categories ── */}
      <div className="bg-[#243044] border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-3">
          <div className="flex items-stretch h-10">
            {/* All categories — FULL HEIGHT mega menu trigger */}
            <MegaNav />

            {/* Vertical divider */}
            <div className="w-px bg-white/10 my-1.5 mx-1 flex-shrink-0" />

            {/* Sliding nav categories */}
            <div className="flex-1 overflow-hidden">
              <SlidingNavBar />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
