'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Heart, Bell, Menu, Search, MapPin, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import NavCategories from './NavCategories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  const t = useTranslations('Header');
  const { getTotalItems, openSidebar } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const cartCount = getTotalItems();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top nav bar — Amazon-style dark */}
      <div className="artic-nav">
        <div className="max-w-[1500px] mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
            <div className="bg-artic-orange rounded px-2 py-1 text-black font-black text-lg tracking-tight">
              ARTIC
            </div>
            <span className="text-white text-xs hidden lg:block">marketplace</span>
          </Link>

          {/* Delivery location */}
          <Link
            href={isAuthenticated ? '/account/addresses' : '/sign-in'}
            className="hidden md:flex items-start gap-1 text-white hover:text-artic-orange transition-colors text-xs min-w-[120px]"
          >
            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
            <div>
              <div className="text-gray-300">{t('deliverTo', { defaultValue: 'Deliver to' })}</div>
              <div className="font-bold">{user?.name?.split(' ')[0] || t('selectLocation', { defaultValue: 'Select location' })}</div>
            </div>
          </Link>

          {/* Search — takes up most of the space */}
          <div className="flex-1">
            <SearchBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <LanguageSwitcher />
            <ThemeSwitcher />

            {/* Account */}
            <UserMenu />

            {/* Returns */}
            <Link
              href={isAuthenticated ? '/account/orders' : '/sign-in'}
              className="hidden lg:flex flex-col text-xs text-white hover:text-artic-orange transition-colors px-2 py-1 rounded"
            >
              <span className="text-gray-300">{t('returns', { defaultValue: 'Returns' })}</span>
              <span className="font-bold">{t('orders', { defaultValue: '& Orders' })}</span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-white hover:text-artic-orange transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-6 w-6" />
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                href="/account/notifications"
                className="relative p-2 text-white hover:text-artic-orange transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={openSidebar}
              className="relative flex items-center gap-1 text-white hover:text-artic-orange transition-colors p-2"
              aria-label={`Cart with ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingCart className="h-7 w-7" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-artic-orange text-black text-xs font-bold p-0 border-0">
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
              </div>
              <span className="hidden lg:block font-bold text-sm">
                {t('cart', { defaultValue: 'Cart' })}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary nav — categories */}
      <div className="artic-nav-secondary">
        <div className="max-w-[1500px] mx-auto px-4 h-10 flex items-center gap-1">
          {/* All categories hamburger */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 gap-2 font-bold text-sm"
          >
            <Menu className="h-4 w-4" />
            {t('allCategories', { defaultValue: 'All' })}
          </Button>

          <NavCategories />
        </div>
      </div>
    </header>
  );
}
