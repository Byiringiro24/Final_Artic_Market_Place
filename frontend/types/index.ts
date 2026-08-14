// ARTIC Marketplace — Shared TypeScript types

export type Locale = 'en-US' | 'fr' | 'ar';

export type UserRole = 'USER' | 'ADMIN' | 'SELLER';

export type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED'
  | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  | 'REFUNDED' | 'RETURN_REQUESTED' | 'RETURNED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'PARTIALLY_REFUNDED' | 'REFUNDED' | 'FAILED';

export type PaymentMethod = 'STRIPE' | 'PAYPAL' | 'CASH_ON_DELIVERY';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  sortOrder: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  priceAdjust: number;
  stock: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  brandId?: string;
  description?: string;
  shortDesc?: string;
  price: number;
  listPrice: number;
  countInStock: number;
  sku?: string;
  images: string[];
  tags: string[];
  avgRating: number;
  numReviews: number;
  numSales: number;
  isPublished: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDesc?: string;
  createdAt: string;
  updatedAt: string;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  brand?: Pick<Brand, 'id' | 'name' | 'logo'> | null;
  variants?: ProductVariant[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  images: string[];
  adminReply?: string;
  createdAt: string;
  user: Pick<User, 'name' | 'image'>;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  label?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'listPrice' | 'images' | 'countInStock'>;
  variant?: ProductVariant;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantInfo?: Record<string, string>;
  product: Pick<Product, 'slug'>;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  shippingAddressId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentResult?: Record<string, unknown>;
  couponCode?: string;
  couponDiscount: number;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  expectedDelivery?: string;
  trackingNumber?: string;
  carrier?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
  shippingAddress: Address;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface WebPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  metaTitle?: string;
  metaDesc?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardStats {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalPrice: number;
    status: OrderStatus;
    createdAt: string;
    user: Pick<User, 'name' | 'email'>;
  }>;
  topProducts: Array<Pick<Product, 'id' | 'name' | 'images' | 'numSales' | 'price'>>;
  lowStockProducts: Array<Pick<Product, 'id' | 'name' | 'countInStock' | 'images'>>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  salesByCategory: Array<{ category: string; total: number }>;
  ordersByStatus: Record<string, number>;
}
