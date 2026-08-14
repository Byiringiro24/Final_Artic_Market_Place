/**
 * Centralized React Query key factory
 * Prevents typos and makes cache invalidation predictable
 */
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.products.details(), slug] as const,
    featured: () => [...queryKeys.products.all, 'featured'] as const,
    related: (slug: string) => [...queryKeys.products.all, 'related', slug] as const,
    history: () => [...queryKeys.products.all, 'browsing-history'] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    detail: (slug: string) => ['categories', slug] as const,
  },

  // Brands
  brands: {
    all: ['brands'] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    mine: (filters?: Record<string, unknown>) => ['orders', 'mine', filters] as const,
    detail: (id: string) => ['orders', id] as const,
    admin: (filters?: Record<string, unknown>) => ['orders', 'admin', filters] as const,
  },

  // Cart
  cart: {
    all: ['cart'] as const,
  },

  // Wishlist
  wishlist: {
    all: ['wishlist'] as const,
  },

  // Reviews
  reviews: {
    product: (productId: string, filters?: Record<string, unknown>) =>
      ['reviews', 'product', productId, filters] as const,
    admin: (filters?: Record<string, unknown>) => ['reviews', 'admin', filters] as const,
  },

  // Users
  users: {
    me: ['users', 'me'] as const,
    addresses: ['users', 'addresses'] as const,
    admin: (filters?: Record<string, unknown>) => ['users', 'admin', filters] as const,
  },

  // Admin
  admin: {
    dashboard: (days?: number) => ['admin', 'dashboard', days] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    group: (group: string) => ['settings', group] as const,
  },

  // Banners
  banners: {
    active: ['banners', 'active'] as const,
    all: ['banners', 'all'] as const,
  },

  // Pages
  pages: {
    all: ['pages'] as const,
    detail: (slug: string) => ['pages', slug] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
  },

  // Promotions
  promotions: {
    all: ['promotions'] as const,
  },
};
