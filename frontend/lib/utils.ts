import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(price));
}

export function formatDate(date: string | Date, format = 'MMM dd, yyyy'): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '...';
}

export function getDiscountPercent(price: number, listPrice: number): number {
  if (!listPrice || listPrice <= price) return 0;
  return Math.round(((listPrice - price) / listPrice) * 100);
}

export function generateStarArray(rating: number): Array<'full' | 'half' | 'empty'> {
  const stars: Array<'full' | 'half' | 'empty'> = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('full');
    else if (rating >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }
  return stars;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
    RETURN_REQUESTED: 'bg-orange-100 text-orange-800',
    RETURNED: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function buildQueryString(params: Record<string, unknown>): string {
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null);
  if (!filtered.length) return '';
  return '?' + filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}
