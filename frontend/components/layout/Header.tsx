'use client';

import Link from 'next/link';
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

          {/* Logo — unique ARTIC brand, NOT Amazon style */}
          <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0 mr-2 group">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#18A89A] to-[#0F7A70] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg leading-none">A</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#FFB800] rounded-full border-2 border-[#1A2332]" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-black text-xl tracking-tight">ARTIC</span>
              <span className="text-[#18A89A] text-[9px] font-semibold tracking-[0.15em] uppercase">Marketplace</span>
            </div>
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
