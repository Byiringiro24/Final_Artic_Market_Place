// ARTIC Marketplace — Shared frontend constants

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ARTIC Marketplace';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const SUPPORTED_LOCALES = ['en-US', 'fr', 'ar'] as const;
export const DEFAULT_LOCALE = 'en-US';

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'RETURN_REQUESTED',
  'RETURNED',
] as const;

export const PAYMENT_METHODS = [
  { id: 'STRIPE', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'PAYPAL', label: 'PayPal', icon: '🅿️' },
  { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: '💵' },
] as const;

export const FREE_SHIPPING_THRESHOLD = 50;
export const TAX_RATE = 0.18;
export const DEFAULT_SHIPPING_PRICE = 9.99;

export const PRODUCTS_PER_PAGE = 24;
export const REVIEWS_PER_PAGE = 10;
export const ORDERS_PER_PAGE = 10;

export const IMAGE_PLACEHOLDER = '/images/placeholder.jpg';

export const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Avg. Customer Review', value: 'rating_desc' },
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Best Sellers', value: 'best_selling' },
] as const;
