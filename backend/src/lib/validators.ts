import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
  }),
});

// ─── Products ────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(500),
    categoryId: z.string().uuid(),
    brandId: z.string().uuid().optional(),
    description: z.string().optional(),
    shortDesc: z.string().max(300).optional(),
    price: z.number().positive(),
    listPrice: z.number().positive(),
    countInStock: z.number().int().min(0),
    sku: z.string().optional(),
    weight: z.number().positive().optional(),
    images: z.array(z.string().url()).min(1),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    metaTitle: z.string().max(70).optional(),
    metaDesc: z.string().max(160).optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    rating: z.string().optional(),
    sort: z.string().optional(),
    featured: z.string().optional(),
    tags: z.string().optional(),
  }),
});

// ─── Orders ──────────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddressId: z.string().uuid(),
    paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'CASH_ON_DELIVERY']),
    couponCode: z.string().optional(),
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(100),
        variantInfo: z.record(z.string()).optional(),
      })
    ).min(1, 'Order must have at least one item'),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'PENDING','CONFIRMED','PROCESSING','SHIPPED',
      'OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED',
      'RETURN_REQUESTED','RETURNED',
    ]),
    trackingNumber: z.string().optional(),
    carrier: z.string().optional(),
    note: z.string().optional(),
  }),
});

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(200).optional(),
    comment: z.string().min(10).max(5000),
    images: z.array(z.string().url()).optional(),
  }),
});

// ─── Addresses ───────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100),
    phone: z.string().min(7).max(20),
    street: z.string().min(3).max(200),
    city: z.string().min(2).max(100),
    province: z.string().min(1).max(100),
    postalCode: z.string().min(3).max(20),
    country: z.string().min(2).max(100),
    isDefault: z.boolean().optional(),
    label: z.string().max(50).optional(),
  }),
});

// ─── Promotions ───────────────────────────────────────────────────────────────

export const createPromotionSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50).toUpperCase(),
    description: z.string().optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y']),
    value: z.number().min(0),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().positive().optional(),
    maxUses: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().min(1).max(100).optional(),
  }),
});

// ─── Settings ────────────────────────────────────────────────────────────────

export const updateSettingsSchema = z.object({
  body: z.array(
    z.object({
      key: z.string().min(1),
      value: z.unknown(),
      group: z.string().min(1),
      label: z.string().optional(),
    })
  ).min(1),
});
