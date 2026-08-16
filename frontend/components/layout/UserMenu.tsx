'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { User, LogOut, Package, Heart, LayoutDashboard, ChevronDown, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth.store';
import { post } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();

  async function handleLogout() {
    try {
      await post('/auth/logout');
    } catch {
      // ignore
    }
    logout();
    router.push(`/${locale}/sign-in`);
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={`/${locale}/sign-in`}
        className="hidden md:flex flex-col text-xs text-white hover:text-artic-orange transition-colors px-2 py-1 rounded"
      >
        <span className="text-gray-300">Hello, sign in</span>
        <span className="font-bold flex items-center gap-1">
          Account & Lists <ChevronDown className="h-3 w-3" />
        </span>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hidden md:flex flex-col text-xs text-white hover:text-artic-orange transition-colors px-2 py-1 rounded">
          <span className="text-gray-300 flex items-center gap-1">
            Hello, {user?.name?.split(' ')[0]}
            {isAdmin() && (
              <span className="bg-artic-orange text-black text-[10px] font-bold px-1 rounded leading-tight">
                ADMIN
              </span>
            )}
          </span>
          <span className="font-bold flex items-center gap-1">
            Account & Lists <ChevronDown className="h-3 w-3" />
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Admin section at the top for admins */}
        {isAdmin() && (
          <>
            <div className="px-2 py-1.5 bg-artic-orange/10 border-b">
              <p className="text-xs font-semibold text-artic-orange-dark flex items-center gap-1">
                <Shield className="h-3 w-3" /> Administrator Account
              </p>
            </div>
            <DropdownMenuItem asChild className="text-artic-orange-dark font-semibold">
              <Link href={`/${locale}/admin/overview`}>
                <LayoutDashboard className="h-4 w-4 mr-2" /> Admin Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/${locale}/account`}>
            <User className="h-4 w-4 mr-2" /> Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/${locale}/account/orders`}>
            <Package className="h-4 w-4 mr-2" /> My Orders
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/${locale}/wishlist`}>
            <Heart className="h-4 w-4 mr-2" /> Wishlist
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
