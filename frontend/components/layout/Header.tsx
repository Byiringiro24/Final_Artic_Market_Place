'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ShoppingCart, Heart, Bell, Menu, Search } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import MegaNav from './MegaNav';
import SlidingNavBar from './SlidingNavBar';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  const locale = useLocale();
  const { getTotalItems, openSidebar } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const cartCount = getTotalItems();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ── Main nav bar ── */}
      <div className="bg-artic-navy text-white">
        <div className="max-w-[1500px] mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0 mr-3">
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 rounded-md bg-artic-teal flex items-center justify-center">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="font-black text-xl tracking-tight text-white">
                ARTIC<span className="text-artic-teal">.</span>
              </span>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1">
            <SearchBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <UserMenu />

            {/* Wishlist */}
            <Link href={`/${locale}/wishlist`} className="relative p-2 text-white hover:text-artic-teal transition-colors hidden sm:block" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <Link href={`/${locale}/account/notifications`} className="relative p-2 text-white hover:text-artic-teal transition-colors hidden sm:block" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={openSidebar}
              className="relative flex items-center gap-1.5 text-white hover:text-artic-teal transition-colors p-2"
              aria-label={`Cart with ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-artic-teal text-white text-[10px] font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-sm font-semibold">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Sub-nav with mega-menu + sliding categories ── */}
      <div className="bg-artic-navy-light text-white shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4">
          <div className="flex items-center h-10">
            {/* All categories button → mega menu */}
            <MegaNav />

            {/* Divider */}
            <div className="w-px h-5 bg-white/20 mx-2 flex-shrink-0" />

            {/* Sliding nav categories */}
            <SlidingNavBar />
          </div>
        </div>
      </div>
    </header>
  );
}
