/**
 * ARTIC Marketplace — Database Seeder
 * Uses real Unsplash/Pexels CDN images as product templates
 */
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Real product images from Unsplash/Picsum (free CDN) ─────────────────────
const PRODUCT_IMAGES = {
  phone: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85',
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=85',
  ],
  laptop: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85',
  ],
  headphones: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=85',
  ],
  shoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=85',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=85',
  ],
  watch: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85',
    'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=85',
  ],
  bag: [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=85',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85',
  ],
  furniture: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=85',
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85',
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=85',
  ],
  camera: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=85',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=85',
  ],
  tshirt: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=85',
  ],
  speaker: [
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=85',
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=85',
  ],
  tablet: [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=85',
  ],
  perfume: [
    'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=85',
    'https://images.unsplash.com/photo-1588776814546-ec7e31de5fe4?w=800&q=85',
  ],
  sunglasses: [
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=85',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=85',
  ],
  fitness: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=85',
  ],
  gaming: [
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=85',
    'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=85',
  ],
};

async function main() {
  console.log('🌱 Seeding ARTIC Marketplace database...\n');

  // ─── Clean up ─────────────────────────────────────────────────────────────
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
  await prisma.webPage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.contactInfo.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.emailVerifyToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.sellerApplication.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ────────────────────────────────────────────────────────────────
  const hashed = await bcrypt.hash('Admin@123', 12);
  const hashedUser = await bcrypt.hash('User@123', 12);

  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'articltd1@gmail.com', password: hashed, role: Role.ADMIN, emailVerified: true },
  });
  const user1 = await prisma.user.create({
    data: { name: 'John Doe', email: 'john@example.com', password: hashedUser, role: Role.USER, emailVerified: true },
  });
  await prisma.user.create({
    data: { name: 'Jane Smith', email: 'jane@example.com', password: hashedUser, role: Role.USER, emailVerified: true },
  });

  await prisma.address.create({
    data: {
      userId: user1.id, fullName: 'John Doe', phone: '+250787585826',
      street: 'KG 11 Ave', city: 'Kigali', province: 'Kigali', postalCode: '00000', country: 'RW', isDefault: true,
    },
  });
  console.log('✅ Users created');

  // ─── Categories ────────────────────────────────────────────────────────────
  const electronics = await prisma.category.create({ data: { name: 'Electronics', slug: 'electronics', sortOrder: 1 } });
  const fashion = await prisma.category.create({ data: { name: 'Fashion', slug: 'fashion', sortOrder: 2 } });
  const homeKitchen = await prisma.category.create({ data: { name: 'Home & Kitchen', slug: 'home-kitchen', sortOrder: 3 } });
  const sports = await prisma.category.create({ data: { name: 'Sports & Outdoors', slug: 'sports-outdoors', sortOrder: 4 } });
  const beauty = await prisma.category.create({ data: { name: 'Beauty & Health', slug: 'beauty-health', sortOrder: 5 } });

  const phones = await prisma.category.create({ data: { name: 'Phones', slug: 'phones', parentId: electronics.id, sortOrder: 1 } });
  const laptops = await prisma.category.create({ data: { name: 'Laptops', slug: 'laptops', parentId: electronics.id, sortOrder: 2 } });
  const audio = await prisma.category.create({ data: { name: 'Audio', slug: 'audio', parentId: electronics.id, sortOrder: 3 } });
  await prisma.category.create({ data: { name: 'Gaming', slug: 'gaming', parentId: electronics.id, sortOrder: 4 } });
  await prisma.category.create({ data: { name: "Men's Clothing", slug: 'mens-clothing', parentId: fashion.id, sortOrder: 1 } });
  await prisma.category.create({ data: { name: "Women's Clothing", slug: 'womens-clothing', parentId: fashion.id, sortOrder: 2 } });
  console.log('✅ Categories created');

  // ─── Brands ───────────────────────────────────────────────────────────────
  const samsung = await prisma.brand.create({ data: { name: 'Samsung', slug: 'samsung' } });
  const apple = await prisma.brand.create({ data: { name: 'Apple', slug: 'apple' } });
  const nike = await prisma.brand.create({ data: { name: 'Nike', slug: 'nike' } });
  const sony = await prisma.brand.create({ data: { name: 'Sony', slug: 'sony' } });
  const lenovo = await prisma.brand.create({ data: { name: 'Lenovo', slug: 'lenovo' } });
  const logitech = await prisma.brand.create({ data: { name: 'Logitech', slug: 'logitech' } });
  console.log('✅ Brands created');

  // ─── Products (with real online images) ──────────────────────────────────
  const products = [
    {
      name: 'Samsung Galaxy S25 Ultra 256GB',
      slug: 'samsung-galaxy-s25-ultra',
      categoryId: phones.id, brandId: samsung.id,
      description: '## Samsung Galaxy S25 Ultra\n\nThe ultimate Android flagship with AI-powered camera, built-in S Pen, and titanium frame.\n\n**Key Features:**\n- 200MP main camera with AI enhancements\n- Built-in S Pen\n- 6.8" Dynamic AMOLED display\n- 5000mAh battery\n- Snapdragon 8 Elite chip',
      shortDesc: 'Ultimate Android flagship with S Pen and 200MP AI camera',
      price: 1199.99, listPrice: 1299.99, countInStock: 45,
      images: PRODUCT_IMAGES.phone,
      tags: ['flagship', 'android', '5g', 'new arrival'],
      avgRating: 4.8, numReviews: 312, numSales: 890, isPublished: true, isFeatured: true,
    },
    {
      name: 'Apple AirPods Pro (3rd Gen)',
      slug: 'airpods-pro-3rd-gen',
      categoryId: audio.id, brandId: apple.id,
      description: '## Apple AirPods Pro\n\nIndustry-leading Active Noise Cancellation with Adaptive Audio that continuously adapts to your environment.\n\n**Features:**\n- Active Noise Cancellation\n- Adaptive Audio\n- Up to 6 hours listening\n- Wireless charging case',
      shortDesc: 'Best-in-class ANC wireless earbuds',
      price: 249.99, listPrice: 299.99, countInStock: 120,
      images: PRODUCT_IMAGES.headphones,
      tags: ['wireless', 'anc', 'apple', 'earbuds'],
      avgRating: 4.9, numReviews: 2431, numSales: 8750, isPublished: true, isFeatured: true,
    },
    {
      name: 'Sony WH-1000XM6 Wireless Headphones',
      slug: 'sony-wh1000xm6',
      categoryId: audio.id, brandId: sony.id,
      description: '## Sony WH-1000XM6\n\nIndustry-leading noise canceling with 40-hour battery life and multipoint connection.\n\n**Features:**\n- Industry-leading ANC\n- 40-hour battery\n- Speak-to-Chat technology\n- Hi-Res Audio',
      shortDesc: 'Premium over-ear ANC headphones with 40hr battery',
      price: 349.99, listPrice: 449.99, countInStock: 67,
      images: PRODUCT_IMAGES.headphones,
      tags: ['headphones', 'wireless', 'noise-canceling'],
      avgRating: 4.7, numReviews: 891, numSales: 2100, isPublished: true, isFeatured: false,
    },
    {
      name: 'Lenovo ThinkPad X1 Carbon',
      slug: 'lenovo-thinkpad-x1-carbon',
      categoryId: laptops.id, brandId: lenovo.id,
      description: '## Lenovo ThinkPad X1 Carbon\n\nThe world\'s lightest 14" business laptop with military-grade durability.\n\n**Specs:**\n- Intel Core Ultra 7\n- 16GB RAM, 512GB SSD\n- 14" WUXGA IPS display\n- 15-hour battery life',
      shortDesc: 'Ultra-light business laptop, military-grade durability',
      price: 1449.99, listPrice: 1699.99, countInStock: 30,
      images: PRODUCT_IMAGES.laptop,
      tags: ['laptop', 'business', 'lightweight', 'lenovo'],
      avgRating: 4.6, numReviews: 445, numSales: 560, isPublished: true, isFeatured: true,
    },
    {
      name: 'Nike Air Max 270 Running Shoes',
      slug: 'nike-air-max-270',
      categoryId: fashion.id, brandId: nike.id,
      description: '## Nike Air Max 270\n\nBoasting the biggest heel Air unit yet for incredible all-day comfort.\n\n**Features:**\n- Max Air heel unit\n- Breathable mesh upper\n- Rubber sole for traction\n- Available in multiple colorways',
      shortDesc: 'Iconic Air cushioning sneaker for all-day comfort',
      price: 129.99, listPrice: 160.00, countInStock: 200,
      images: PRODUCT_IMAGES.shoes,
      tags: ['sneakers', 'running', 'nike', 'casual'],
      avgRating: 4.6, numReviews: 3201, numSales: 15000, isPublished: true, isFeatured: true,
    },
    {
      name: 'Premium Leather Watch for Men',
      slug: 'premium-leather-watch-men',
      categoryId: fashion.id, brandId: null,
      description: '## Premium Leather Watch\n\nElegant timepiece with genuine leather strap and sapphire crystal glass.\n\n**Features:**\n- Japanese quartz movement\n- Genuine leather strap\n- Sapphire crystal glass\n- Water resistant 50m\n- Date display',
      shortDesc: 'Elegant leather watch with sapphire crystal glass',
      price: 189.99, listPrice: 250.00, countInStock: 85,
      images: PRODUCT_IMAGES.watch,
      tags: ['watch', 'luxury', 'leather', 'men'],
      avgRating: 4.5, numReviews: 234, numSales: 890, isPublished: true, isFeatured: false,
    },
    {
      name: 'Sony A7 IV Full-Frame Mirrorless Camera',
      slug: 'sony-a7-iv',
      categoryId: electronics.id, brandId: sony.id,
      description: '## Sony A7 IV\n\nThe next generation of the legendary A7 series with 33MP BSI sensor and advanced autofocus.\n\n**Specs:**\n- 33MP BSI CMOS sensor\n- 759 phase-detect AF points\n- 4K 60p video\n- 5-axis IBIS\n- Dual card slots',
      shortDesc: '33MP full-frame mirrorless with 4K 60p video',
      price: 2499.99, listPrice: 2799.99, countInStock: 18,
      images: PRODUCT_IMAGES.camera,
      tags: ['camera', 'mirrorless', 'sony', 'photography'],
      avgRating: 4.9, numReviews: 567, numSales: 340, isPublished: true, isFeatured: true,
    },
    {
      name: 'Modern 3-Seater Sofa',
      slug: 'modern-3-seater-sofa',
      categoryId: homeKitchen.id, brandId: null,
      description: '## Modern 3-Seater Sofa\n\nContemporary design with premium fabric upholstery and solid wood legs.\n\n**Features:**\n- High-density foam cushions\n- Durable fabric upholstery\n- Solid hardwood frame\n- Available in 5 colors\n- Easy assembly',
      shortDesc: 'Contemporary 3-seat sofa with premium foam cushions',
      price: 699.99, listPrice: 899.99, countInStock: 25,
      images: PRODUCT_IMAGES.furniture,
      tags: ['sofa', 'furniture', 'living room', 'modern'],
      avgRating: 4.4, numReviews: 189, numSales: 230, isPublished: true, isFeatured: false,
    },
    {
      name: 'KitchenAid Stand Mixer 5.5 Quart',
      slug: 'kitchenaid-stand-mixer',
      categoryId: homeKitchen.id, brandId: null,
      description: '## KitchenAid Stand Mixer\n\nPowerful 500W stand mixer with 10 speeds and tilt-head design.\n\n**Includes:**\n- Flat beater\n- Dough hook\n- Wire whip\n- Splash guard\n\n**Capacity:** 5.5 quart stainless steel bowl',
      shortDesc: '500W stand mixer with 10 speeds and tilt-head',
      price: 349.99, listPrice: 449.99, countInStock: 42,
      images: PRODUCT_IMAGES.kitchen,
      tags: ['kitchen', 'baking', 'mixer', 'cooking'],
      avgRating: 4.7, numReviews: 1203, numSales: 1560, isPublished: true, isFeatured: false,
    },
    {
      name: 'Bluetooth Portable Speaker Waterproof',
      slug: 'bluetooth-portable-speaker',
      categoryId: electronics.id, brandId: null,
      description: '## Bluetooth Portable Speaker\n\n360° sound with deep bass, waterproof design for outdoor adventures.\n\n**Features:**\n- 360° surround sound\n- IPX7 waterproof\n- 24-hour battery life\n- USB-C charging\n- Pair two for stereo',
      shortDesc: '360° sound, IPX7 waterproof, 24hr battery',
      price: 79.99, listPrice: 99.99, countInStock: 150,
      images: PRODUCT_IMAGES.speaker,
      tags: ['speaker', 'bluetooth', 'waterproof', 'outdoor'],
      avgRating: 4.5, numReviews: 678, numSales: 3400, isPublished: true, isFeatured: false,
    },
    {
      name: 'iPad Air 11" M3 Chip 256GB',
      slug: 'ipad-air-m3-256gb',
      categoryId: electronics.id, brandId: apple.id,
      description: '## iPad Air M3\n\nIncredible performance with the M3 chip, stunning Liquid Retina display.\n\n**Specs:**\n- Apple M3 chip\n- 11" Liquid Retina display\n- 256GB storage\n- USB-C port\n- All-day battery',
      shortDesc: 'Powerful iPad with M3 chip and Liquid Retina display',
      price: 699.99, listPrice: 799.99, countInStock: 55,
      images: PRODUCT_IMAGES.tablet,
      tags: ['ipad', 'tablet', 'apple', 'm3'],
      avgRating: 4.8, numReviews: 892, numSales: 1230, isPublished: true, isFeatured: true,
    },
    {
      name: 'Professional Gaming Setup Bundle',
      slug: 'gaming-setup-bundle',
      categoryId: electronics.id, brandId: null,
      description: '## Gaming Setup Bundle\n\nComplete gaming package with RGB keyboard, gaming mouse, headset and mousepad.\n\n**Includes:**\n- Mechanical RGB keyboard\n- 16000 DPI gaming mouse\n- 7.1 surround headset\n- XL mousepad\n- USB hub',
      shortDesc: 'Complete RGB gaming bundle — keyboard, mouse, headset',
      price: 249.99, listPrice: 349.99, countInStock: 60,
      images: PRODUCT_IMAGES.gaming,
      tags: ['gaming', 'rgb', 'setup', 'bundle'],
      avgRating: 4.6, numReviews: 445, numSales: 780, isPublished: true, isFeatured: true,
    },
    {
      name: 'Premium Gym Fitness Bundle',
      slug: 'gym-fitness-bundle',
      categoryId: sports.id, brandId: null,
      description: '## Gym Fitness Bundle\n\nEverything you need for home workouts — dumbbells, resistance bands, yoga mat.\n\n**Includes:**\n- Adjustable dumbbell set (5–25kg)\n- 5 resistance bands\n- Non-slip yoga mat\n- Jump rope\n- Training gloves',
      shortDesc: 'Complete home gym bundle with dumbbells, bands and mat',
      price: 199.99, listPrice: 279.99, countInStock: 80,
      images: PRODUCT_IMAGES.fitness,
      tags: ['fitness', 'gym', 'workout', 'home gym'],
      avgRating: 4.5, numReviews: 334, numSales: 1200, isPublished: true, isFeatured: false,
    },
    {
      name: "Women's Designer Handbag",
      slug: 'womens-designer-handbag',
      categoryId: fashion.id, brandId: null,
      description: '## Designer Handbag\n\nLuxury PU leather handbag with gold hardware, perfect for daily use or special occasions.\n\n**Features:**\n- Premium PU leather\n- Gold-tone hardware\n- Multiple compartments\n- Removable shoulder strap\n- Available in 6 colors',
      shortDesc: 'Luxury PU leather bag with gold hardware, 6 colors',
      price: 89.99, listPrice: 129.99, countInStock: 120,
      images: PRODUCT_IMAGES.bag,
      tags: ['handbag', 'women', 'fashion', 'luxury'],
      avgRating: 4.4, numReviews: 567, numSales: 2300, isPublished: true, isFeatured: false,
    },
    {
      name: "Men's Classic Polo T-Shirt (Pack of 3)",
      slug: 'mens-classic-polo-3pack',
      categoryId: fashion.id, brandId: null,
      description: '## Men\'s Classic Polo (Pack of 3)\n\nPremium cotton polo shirts in 3 colors. Perfect for casual or smart-casual wear.\n\n**Details:**\n- 100% combed cotton\n- Ribbed collar and cuffs\n- Regular fit\n- Machine washable\n- Available S–3XL',
      shortDesc: 'Premium 100% cotton polo shirts, 3-pack combo',
      price: 39.99, listPrice: 59.99, countInStock: 300,
      images: PRODUCT_IMAGES.tshirt,
      tags: ['polo', 'men', 'cotton', 'casual'],
      avgRating: 4.3, numReviews: 1234, numSales: 8900, isPublished: true, isFeatured: false,
    },
  ];

  const createdProducts = [];
  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, categoryId: p.categoryId,
        brandId: p.brandId, description: p.description, shortDesc: p.shortDesc,
        price: p.price, listPrice: p.listPrice, countInStock: p.countInStock,
        images: p.images, tags: p.tags, avgRating: p.avgRating,
        numReviews: p.numReviews, numSales: p.numSales,
        isPublished: p.isPublished, isFeatured: p.isFeatured,
      },
    });
    createdProducts.push(product);
  }

  // Add variants to phones and shoes
  await prisma.productVariant.createMany({
    data: [
      { productId: createdProducts[0].id, name: 'Color', value: 'Titanium Black', stock: 20 },
      { productId: createdProducts[0].id, name: 'Color', value: 'Titanium Gray', stock: 15 },
      { productId: createdProducts[0].id, name: 'Storage', value: '256GB', stock: 25, priceAdjust: 0 },
      { productId: createdProducts[0].id, name: 'Storage', value: '512GB', stock: 20, priceAdjust: 100 },
      { productId: createdProducts[4].id, name: 'Size', value: '8 US', stock: 40 },
      { productId: createdProducts[4].id, name: 'Size', value: '9 US', stock: 50 },
      { productId: createdProducts[4].id, name: 'Size', value: '10 US', stock: 45 },
      { productId: createdProducts[4].id, name: 'Size', value: '11 US', stock: 35 },
      { productId: createdProducts[4].id, name: 'Color', value: 'Black/White', stock: 80 },
      { productId: createdProducts[4].id, name: 'Color', value: 'Red/Black', stock: 60 },
    ],
  });
  console.log('✅ Products with real images created');

  // ─── Reviews ──────────────────────────────────────────────────────────────
  await prisma.review.createMany({
    data: [
      { productId: createdProducts[0].id, userId: user1.id, rating: 5, title: 'Incredible phone!', comment: 'The camera system is absolutely mind-blowing. Best smartphone ever.', status: 'APPROVED', isVerifiedPurchase: true, helpfulCount: 45 },
      { productId: createdProducts[1].id, userId: user1.id, rating: 5, title: 'Worth every penny', comment: 'ANC is phenomenal. Background noise disappears completely.', status: 'APPROVED', isVerifiedPurchase: true, helpfulCount: 123 },
      { productId: createdProducts[4].id, userId: user1.id, rating: 4, title: 'Great comfort, runs slightly large', comment: 'Very comfortable for all-day wear. Order half size down.', status: 'APPROVED', helpfulCount: 67 },
    ],
  });
  console.log('✅ Reviews created');

  // ─── Banners ──────────────────────────────────────────────────────────────
  await prisma.banner.createMany({
    data: [
      { title: 'New Tech 2026', subtitle: 'Latest phones, laptops & gadgets at unbeatable prices', imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1500&q=85', linkUrl: '/categories/electronics', buttonText: 'Shop Electronics', isActive: true, sortOrder: 1 },
      { title: 'Up to 50% Off Fashion', subtitle: 'Limited time deals on top brands', imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1500&q=85', linkUrl: '/categories/fashion', buttonText: 'Shop Fashion', isActive: true, sortOrder: 2 },
      { title: 'Free Shipping Over $50', subtitle: 'On all eligible orders — shop now', imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1500&q=85', linkUrl: '/search', buttonText: 'Shop Now', isActive: true, sortOrder: 3 },
    ],
  });
  console.log('✅ Banners with online images created');

  // ─── Promotions ───────────────────────────────────────────────────────────
  await prisma.promotion.createMany({
    data: [
      { code: 'WELCOME10', description: '10% off your first order', type: 'PERCENTAGE', value: 10, maxDiscountAmount: 50, maxUses: 1000, isActive: true },
      { code: 'SAVE20', description: '$20 off orders over $100', type: 'FIXED_AMOUNT', value: 20, minOrderAmount: 100, isActive: true },
      { code: 'FREESHIP', description: 'Free shipping on any order', type: 'FREE_SHIPPING', value: 0, isActive: true },
      { code: 'ARTIC30', description: '30% off electronics', type: 'PERCENTAGE', value: 30, maxDiscountAmount: 200, maxUses: 500, isActive: true },
    ],
  });
  console.log('✅ Promotions created');

  // ─── Settings ─────────────────────────────────────────────────────────────
  await prisma.setting.createMany({
    data: [
      { key: 'site_name', value: 'ARTIC Marketplace', group: 'site', label: 'Site Name' },
      { key: 'site_description', value: 'Your one-stop marketplace for products and services', group: 'site' },
      { key: 'site_email', value: 'articltd1@gmail.com', group: 'site' },
      { key: 'site_phone', value: '0787585826 / 0785424098', group: 'site' },
      { key: 'default_currency', value: 'USD', group: 'site' },
      { key: 'default_language', value: 'en-US', group: 'site' },
      { key: 'tax_rate', value: 0.18, group: 'site' },
      { key: 'free_shipping_threshold', value: 50, group: 'shipping' },
      { key: 'payment_methods', value: ['stripe', 'paypal', 'cod'], group: 'payment' },
      { key: 'social_whatsapp', value: '0787585826', group: 'social' },
      { key: 'social_facebook', value: 'https://facebook.com/articmarketplace', group: 'social' },
      { key: 'social_instagram', value: 'https://instagram.com/articmarketplace', group: 'social' },
    ],
  });
  console.log('✅ Settings created');

  // ─── Web Pages ────────────────────────────────────────────────────────────
  await prisma.webPage.createMany({
    data: [
      { title: 'About Us', slug: 'about-us', content: '# About ARTIC Marketplace\n\nWe are a premier e-commerce platform connecting buyers with quality products and professional services across Africa and beyond.\n\n## Our Mission\n\nTo make quality products and professional services accessible to everyone, anywhere.\n\n## Our Values\n\n- **Trust**: Verified sellers and service providers\n- **Quality**: Curated products and services\n- **Speed**: Fast delivery and instant booking\n- **Innovation**: AI-powered recommendations', isPublished: true, sortOrder: 1 },
      { title: 'Terms of Service', slug: 'terms-of-service', content: '# Terms of Service\n\nBy using ARTIC Marketplace, you agree to these terms and conditions...', isPublished: true, sortOrder: 2 },
      { title: 'Privacy Policy', slug: 'privacy-policy', content: '# Privacy Policy\n\nYour privacy matters to us. This policy describes how we collect and use your data.', isPublished: true, sortOrder: 3 },
      { title: 'FAQ', slug: 'faq', content: '# Frequently Asked Questions\n\n## How do I track my order?\nLog in to your account and visit Orders section.\n\n## What is your return policy?\n30-day returns on most items.', isPublished: true, sortOrder: 4 },
      { title: 'Returns Policy', slug: 'returns', content: '# Returns & Refunds\n\nWe offer 30-day returns on most items. Items must be in original condition.', isPublished: true, sortOrder: 5 },
    ],
  });
  console.log('✅ Web pages created');

  // ─── Shipping ─────────────────────────────────────────────────────────────
  const zone = await prisma.shippingZone.create({ data: { name: 'East Africa', countries: ['RW', 'KE', 'UG', 'TZ'], isActive: true } });
  await prisma.shippingRate.createMany({
    data: [
      { zoneId: zone.id, name: 'Standard', type: 'FLAT', price: 9.99, estimatedDays: '5-7' },
      { zoneId: zone.id, name: 'Express', type: 'FLAT', price: 19.99, estimatedDays: '2-3' },
      { zoneId: zone.id, name: 'Same Day', type: 'FLAT', price: 29.99, estimatedDays: '0-1' },
      { zoneId: zone.id, name: 'Free Shipping', type: 'FREE', price: 0, minOrderValue: 50, estimatedDays: '5-7' },
    ],
  });
  console.log('✅ Shipping created');

  // ─── Services ─────────────────────────────────────────────────────────────
  await prisma.service.createMany({
    data: [
      { title: 'Professional Product Photography', slug: 'product-photography', description: '## Professional Product Photography\n\nHigh-quality product photos that sell. Studio lighting, multiple angles, white background, and retouching included.\n\n**What you get:**\n- 10 edited product photos\n- White/gradient background\n- 48-hour delivery\n- Commercial usage rights', shortDesc: 'Studio product photography for your listings', price: 99, priceType: 'fixed', category: 'Photography', images: [PRODUCT_IMAGES.camera[0]], isActive: true, isFeatured: true, sortOrder: 1 },
      { title: 'Same-Day Delivery Service', slug: 'same-day-delivery', description: '## Same-Day Delivery\n\nReliable same-day and next-day delivery services within Kigali and major cities.\n\n**Coverage:**\n- Kigali City: Same-day delivery\n- Other provinces: 2-3 days\n- Real-time tracking\n- Proof of delivery', shortDesc: 'Fast delivery within the city — same day available', price: 5, priceType: 'fixed', category: 'Logistics', images: [], isActive: true, isFeatured: true, sortOrder: 2 },
      { title: 'Phone & Laptop Repair', slug: 'phone-laptop-repair', description: '## Device Repair Service\n\nCertified technicians for all phone and laptop repairs.\n\n**Services:**\n- Screen replacement\n- Battery replacement\n- Water damage repair\n- Software issues\n- Free diagnosis', shortDesc: 'Certified technicians for all device repairs', price: 25, priceType: 'hourly', category: 'Technology', images: [], isActive: true, isFeatured: true, sortOrder: 3 },
      { title: 'Home Cleaning Service', slug: 'home-cleaning', description: '## Professional Home Cleaning\n\nThorough home cleaning by trained and vetted professionals.\n\n**Includes:**\n- Deep cleaning of all rooms\n- Kitchen and bathroom sanitization\n- Window cleaning\n- All equipment provided', shortDesc: 'Vetted professionals for deep home cleaning', priceType: 'quote', category: 'Home Services', images: [], isActive: true, isFeatured: false, sortOrder: 4 },
      { title: 'Seller Onboarding Consultation', slug: 'seller-onboarding', description: '## Seller Onboarding\n\n1-on-1 consultation with our team to get your store live and optimized.\n\n**What we cover:**\n- Account setup\n- Product listing best practices\n- Pricing strategy\n- Marketing tips\n- Q&A session', shortDesc: 'Launch your store with expert 1-on-1 guidance', price: 49, priceType: 'fixed', category: 'Consulting', images: [], isActive: true, isFeatured: false, sortOrder: 5 },
    ],
  });
  console.log('✅ Services created');

  // ─── Contact info ─────────────────────────────────────────────────────────
  await prisma.contactInfo.createMany({
    data: [
      { key: 'email', value: 'articltd1@gmail.com', label: 'Email', group: 'contact' },
      { key: 'phone1', value: '0787585826', label: 'Phone 1', group: 'contact' },
      { key: 'phone2', value: '0785424098', label: 'Phone 2', group: 'contact' },
      { key: 'whatsapp', value: '0787585826', label: 'WhatsApp', group: 'contact' },
      { key: 'address', value: 'Kigali, Rwanda', label: 'Address', group: 'contact' },
      { key: 'support_hours', value: 'Mon–Fri: 8AM–6PM | Sat: 9AM–3PM', label: 'Hours', group: 'contact' },
      { key: 'facebook', value: 'https://facebook.com/articmarketplace', label: 'Facebook', group: 'social' },
      { key: 'twitter', value: 'https://twitter.com/articmarket', label: 'Twitter', group: 'social' },
      { key: 'instagram', value: 'https://instagram.com/articmarketplace', label: 'Instagram', group: 'social' },
      { key: 'linkedin', value: 'https://linkedin.com/company/artic-marketplace', label: 'LinkedIn', group: 'social' },
      { key: 'youtube', value: 'https://youtube.com/@articmarketplace', label: 'YouTube', group: 'social' },
      { key: 'tiktok', value: 'https://tiktok.com/@articmarketplace', label: 'TikTok', group: 'social' },
    ],
  });
  console.log('✅ Contact info created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo credentials:');
  console.log('  Admin: articltd1@gmail.com / Admin@123');
  console.log('  User:  john@example.com / User@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); }).finally(() => prisma.$disconnect());
