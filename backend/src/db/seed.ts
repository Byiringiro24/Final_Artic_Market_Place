/**
 * ARTIC Marketplace — Database Seeder
 * Populates PostgreSQL with realistic sample data
 */
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ARTIC Marketplace database...\n');

  // ─── Clean up existing data ─────────────────────────────────────────────────
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.browsingHistory.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.emailVerifyToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ─────────────────────────────────────────────────────────────────
  const hashedAdmin = await bcrypt.hash('Admin@123', 12);
  const hashedUser = await bcrypt.hash('User@123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@articmarketplace.com',
      password: hashedAdmin,
      role: Role.ADMIN,
      emailVerified: true,
      isActive: true,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedUser,
      role: Role.USER,
      emailVerified: true,
      isActive: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedUser,
      role: Role.USER,
      emailVerified: true,
      isActive: true,
    },
  });

  console.log(`✅ Users created: ${admin.email}, ${user1.email}, ${user2.email}`);

  // ─── Addresses ─────────────────────────────────────────────────────────────
  await prisma.address.create({
    data: {
      userId: user1.id,
      fullName: 'John Doe',
      phone: '+1-555-0100',
      street: '123 Main Street',
      city: 'New York',
      province: 'NY',
      postalCode: '10001',
      country: 'US',
      isDefault: true,
    },
  });

  // ─── Categories ────────────────────────────────────────────────────────────
  const electronics = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics', description: 'Gadgets & tech', sortOrder: 1 },
  });
  const fashion = await prisma.category.create({
    data: { name: 'Fashion', slug: 'fashion', description: 'Clothing & accessories', sortOrder: 2 },
  });
  const homeKitchen = await prisma.category.create({
    data: { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home goods', sortOrder: 3 },
  });
  const sports = await prisma.category.create({
    data: { name: 'Sports & Outdoors', slug: 'sports-outdoors', sortOrder: 4 },
  });

  // Subcategories
  const phones = await prisma.category.create({
    data: { name: 'Phones', slug: 'phones', parentId: electronics.id, sortOrder: 1 },
  });
  await prisma.category.create({
    data: { name: 'Laptops', slug: 'laptops', parentId: electronics.id, sortOrder: 2 },
  });
  await prisma.category.create({
    data: { name: "Men's Clothing", slug: 'mens-clothing', parentId: fashion.id, sortOrder: 1 },
  });

  console.log('✅ Categories created');

  // ─── Brands ────────────────────────────────────────────────────────────────
  const samsung = await prisma.brand.create({ data: { name: 'Samsung', slug: 'samsung' } });
  const apple = await prisma.brand.create({ data: { name: 'Apple', slug: 'apple' } });
  const nike = await prisma.brand.create({ data: { name: 'Nike', slug: 'nike' } });
  const sony = await prisma.brand.create({ data: { name: 'Sony', slug: 'sony' } });

  console.log('✅ Brands created');

  // ─── Products ──────────────────────────────────────────────────────────────
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S25 Ultra',
        slug: 'samsung-galaxy-s25-ultra',
        categoryId: phones.id,
        brandId: samsung.id,
        description: '## Samsung Galaxy S25 Ultra\n\nThe ultimate Android flagship with AI-powered camera system, S Pen, and 200MP sensor.',
        shortDesc: 'Ultimate Android flagship with AI camera',
        price: 1199.99,
        listPrice: 1299.99,
        countInStock: 45,
        sku: 'SGS25U-256',
        images: ['/images/products/s25-1.jpg', '/images/products/s25-2.jpg'],
        tags: ['flagship', 'android', '5g', 'new arrival'],
        isPublished: true,
        isFeatured: true,
        avgRating: 4.8,
        numReviews: 124,
        numSales: 312,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Apple AirPods Pro (3rd Gen)',
        slug: 'apple-airpods-pro-3rd-gen',
        categoryId: electronics.id,
        brandId: apple.id,
        description: '## AirPods Pro\n\nIndustry-leading Active Noise Cancellation with Adaptive Audio and Transparency mode.',
        shortDesc: 'Best-in-class ANC wireless earbuds',
        price: 249.99,
        listPrice: 299.99,
        countInStock: 120,
        sku: 'APP3-WHT',
        images: ['/images/products/airpods-1.jpg'],
        tags: ['wireless', 'earbuds', 'anc', 'apple'],
        isPublished: true,
        isFeatured: true,
        avgRating: 4.9,
        numReviews: 2431,
        numSales: 8750,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sony WH-1000XM6 Headphones',
        slug: 'sony-wh-1000xm6-headphones',
        categoryId: electronics.id,
        brandId: sony.id,
        description: '## Sony WH-1000XM6\n\nIndustry-leading noise canceling with 40-hour battery life and multipoint connection.',
        shortDesc: 'Premium over-ear noise canceling headphones',
        price: 379.99,
        listPrice: 449.99,
        countInStock: 67,
        sku: 'SWH1000XM6-BLK',
        images: ['/images/products/sony-xm6-1.jpg'],
        tags: ['headphones', 'wireless', 'noise-canceling', 'sony'],
        isPublished: true,
        isFeatured: false,
        avgRating: 4.7,
        numReviews: 891,
        numSales: 2100,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Nike Air Max 270',
        slug: 'nike-air-max-270',
        categoryId: fashion.id,
        brandId: nike.id,
        description: '## Nike Air Max 270\n\nBoasting the biggest heel Air unit in the lineup for an incredibly comfortable ride.',
        shortDesc: 'Iconic Air cushioning comfort sneaker',
        price: 129.99,
        listPrice: 160.00,
        countInStock: 200,
        sku: 'NAM270-BLK',
        images: ['/images/products/airmax-1.jpg', '/images/products/airmax-2.jpg'],
        tags: ['sneakers', 'running', 'nike', 'casual'],
        isPublished: true,
        isFeatured: true,
        avgRating: 4.6,
        numReviews: 3201,
        numSales: 15000,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Premium Kitchen Stand Mixer',
        slug: 'premium-kitchen-stand-mixer',
        categoryId: homeKitchen.id,
        brandId: null,
        description: '## 5.5-Quart Stand Mixer\n\nPowerful 500W motor with 10 speeds. Tilt-head design for easy bowl access. Includes flat beater, dough hook, and wire whip.',
        shortDesc: '500W 5.5-qt professional stand mixer',
        price: 299.99,
        listPrice: 399.99,
        countInStock: 35,
        images: ['/images/products/mixer-1.jpg'],
        tags: ['kitchen', 'baking', 'cooking', 'home'],
        isPublished: true,
        isFeatured: false,
        avgRating: 4.5,
        numReviews: 567,
        numSales: 890,
      },
    }),
  ]);

  // Add variants to products
  await prisma.productVariant.createMany({
    data: [
      { productId: products[0].id, name: 'Color', value: 'Titanium Black', stock: 20 },
      { productId: products[0].id, name: 'Color', value: 'Titanium Gray', stock: 15 },
      { productId: products[0].id, name: 'Storage', value: '256GB', stock: 25 },
      { productId: products[0].id, name: 'Storage', value: '512GB', stock: 20, priceAdjust: 100 },
      { productId: products[3].id, name: 'Size', value: '8 US', stock: 40 },
      { productId: products[3].id, name: 'Size', value: '9 US', stock: 50 },
      { productId: products[3].id, name: 'Size', value: '10 US', stock: 45 },
      { productId: products[3].id, name: 'Size', value: '11 US', stock: 35 },
      { productId: products[3].id, name: 'Color', value: 'Black/White', stock: 80 },
      { productId: products[3].id, name: 'Color', value: 'Red/Black', stock: 60 },
    ],
  });

  console.log('✅ Products created');

  // ─── Reviews ───────────────────────────────────────────────────────────────
  await prisma.review.createMany({
    data: [
      {
        productId: products[0].id,
        userId: user1.id,
        rating: 5,
        title: 'Incredible phone!',
        comment: 'The camera system is absolutely mind-blowing. Best smartphone I have ever owned.',
        status: 'APPROVED',
        isVerifiedPurchase: true,
        helpfulCount: 45,
      },
      {
        productId: products[1].id,
        userId: user1.id,
        rating: 5,
        title: 'Worth every penny',
        comment: 'ANC is phenomenal. Background noise disappears completely. Sound quality is superb.',
        status: 'APPROVED',
        isVerifiedPurchase: true,
        helpfulCount: 123,
      },
      {
        productId: products[3].id,
        userId: user2.id,
        rating: 4,
        title: 'Great comfort, runs slightly large',
        comment: 'Very comfortable for all-day wear. Would suggest going half size down.',
        status: 'APPROVED',
        helpfulCount: 67,
      },
    ],
  });

  console.log('✅ Reviews created');

  // ─── Banners ───────────────────────────────────────────────────────────────
  await prisma.banner.createMany({
    data: [
      {
        title: 'New Arrivals 2026',
        subtitle: 'Shop the latest tech innovations',
        imageUrl: '/images/banners/banner1.jpg',
        linkUrl: '/search?tags=new arrival',
        buttonText: 'Shop Now',
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Up to 40% Off Fashion',
        subtitle: 'Limited time sale on top brands',
        imageUrl: '/images/banners/banner2.jpg',
        linkUrl: '/categories/fashion',
        buttonText: 'Browse Deals',
        isActive: true,
        sortOrder: 2,
      },
      {
        title: 'Free Shipping Over $50',
        subtitle: 'On all eligible orders',
        imageUrl: '/images/banners/banner3.jpg',
        linkUrl: '/search',
        buttonText: 'Shop All',
        isActive: true,
        sortOrder: 3,
      },
    ],
  });

  console.log('✅ Banners created');

  // ─── Promotions ────────────────────────────────────────────────────────────
  await prisma.promotion.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: '10% off your first order',
        type: 'PERCENTAGE',
        value: 10,
        maxDiscountAmount: 50,
        maxUses: 1000,
        isActive: true,
      },
      {
        code: 'SAVE20',
        description: '$20 off orders over $100',
        type: 'FIXED_AMOUNT',
        value: 20,
        minOrderAmount: 100,
        isActive: true,
      },
      {
        code: 'FREESHIP',
        description: 'Free shipping on any order',
        type: 'FREE_SHIPPING',
        value: 0,
        isActive: true,
      },
    ],
  });

  console.log('✅ Promotions created');

  // ─── Settings ──────────────────────────────────────────────────────────────
  await prisma.setting.createMany({
    data: [
      { key: 'site_name', value: 'ARTIC Marketplace', group: 'site', label: 'Site Name' },
      { key: 'site_description', value: 'The Premier Online Marketplace', group: 'site' },
      { key: 'site_logo', value: '/icons/logo.svg', group: 'site' },
      { key: 'site_email', value: 'support@articmarketplace.com', group: 'site' },
      { key: 'default_currency', value: 'USD', group: 'site' },
      { key: 'default_language', value: 'en-US', group: 'site' },
      { key: 'tax_rate', value: 0.18, group: 'site', label: 'Default Tax Rate' },
      { key: 'free_shipping_threshold', value: 50, group: 'shipping', label: 'Free Shipping Over' },
      { key: 'payment_methods', value: ['stripe', 'paypal', 'cod'], group: 'payment' },
      { key: 'social_facebook', value: 'https://facebook.com/articmarketplace', group: 'social' },
      { key: 'social_twitter', value: 'https://twitter.com/articmarket', group: 'social' },
      { key: 'social_instagram', value: 'https://instagram.com/articmarketplace', group: 'social' },
    ],
  });

  console.log('✅ Settings created');

  // ─── Web Pages ─────────────────────────────────────────────────────────────
  await prisma.webPage.createMany({
    data: [
      {
        title: 'About Us',
        slug: 'about-us',
        content: '# About ARTIC Marketplace\n\nWe are a premium e-commerce platform dedicated to providing the best shopping experience.',
        isPublished: true,
        sortOrder: 1,
        metaTitle: 'About ARTIC Marketplace',
      },
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: '# Terms of Service\n\nBy using ARTIC Marketplace, you agree to these terms...',
        isPublished: true,
        sortOrder: 2,
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: '# Privacy Policy\n\nYour privacy matters to us. This policy describes how we collect and use your data.',
        isPublished: true,
        sortOrder: 3,
      },
      {
        title: 'FAQ',
        slug: 'faq',
        content: '# Frequently Asked Questions\n\n## How do I track my order?\nLog in to your account and visit the Orders section.',
        isPublished: true,
        sortOrder: 4,
      },
    ],
  });

  console.log('✅ Web pages created');

  // ─── Shipping Zones ────────────────────────────────────────────────────────
  const usZone = await prisma.shippingZone.create({
    data: {
      name: 'United States',
      countries: ['US'],
      isActive: true,
    },
  });

  await prisma.shippingRate.createMany({
    data: [
      { zoneId: usZone.id, name: 'Standard Shipping', type: 'FLAT', price: 9.99, estimatedDays: '5-7' },
      { zoneId: usZone.id, name: 'Express Shipping', type: 'FLAT', price: 19.99, estimatedDays: '2-3' },
      { zoneId: usZone.id, name: 'Free Shipping', type: 'FREE', price: 0, minOrderValue: 50, estimatedDays: '5-7' },
    ],
  });

  console.log('✅ Shipping zones created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo credentials:');
  console.log('  Admin: admin@articmarketplace.com / Admin@123');
  console.log('  User:  john@example.com / User@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
