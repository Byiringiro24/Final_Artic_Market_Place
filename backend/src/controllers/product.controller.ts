import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse, buildPagination } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getCache, setCache, deleteCachePattern, CACHE_KEYS } from '../lib/redis';
import slugify from 'slugify';

// ─── List Products ────────────────────────────────────────────────────────────
export async function listProducts(req: Request, res: Response) {
  const {
    page = '1',
    limit = '20',
    category,
    brand,
    search,
    minPrice,
    maxPrice,
    rating,
    sort = 'createdAt_desc',
    featured,
    tags,
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Build filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isPublished: true };

  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };
  if (featured === 'true') where.isFeatured = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }
  if (rating) where.avgRating = { gte: parseFloat(rating) };
  if (tags) where.tags = { hasSome: tags.split(',') };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search] } },
    ];
  }

  // Build sort
  const sortMap: Record<string, object> = {
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    rating_desc: { avgRating: 'desc' },
    newest: { createdAt: 'desc' },
    best_selling: { numSales: 'desc' },
    createdAt_desc: { createdAt: 'desc' },
  };
  const orderBy = sortMap[sort] || { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        listPrice: true,
        images: true,
        avgRating: true,
        numReviews: true,
        countInStock: true,
        isFeatured: true,
        tags: true,
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return ApiResponse.paginated(
    res,
    products,
    buildPagination(pageNum, limitNum, total)
  );
}

// ─── Get Single Product ───────────────────────────────────────────────────────
export async function getProduct(req: Request, res: Response) {
  const { slug } = req.params;

  const cached = await getCache(CACHE_KEYS.PRODUCT(slug));
  if (cached) return ApiResponse.success(res, cached);

  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, logo: true } },
      variants: true,
      reviews: {
        where: { status: 'APPROVED' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, image: true } },
        },
      },
    },
  });

  if (!product) throw new AppError('Product not found', 404);

  await setCache(CACHE_KEYS.PRODUCT(slug), product, 300);
  return ApiResponse.success(res, product);
}

// ─── Create Product (Admin) ───────────────────────────────────────────────────
export async function createProduct(req: Request, res: Response) {
  const {
    name, categoryId, brandId, description, shortDesc,
    price, listPrice, countInStock, sku, weight,
    images, videos, tags, colors, sizes, isPublished, isFeatured,
    metaTitle, metaDesc,
  } = req.body;

  const slug = slugify(name, { lower: true, strict: true });

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw new AppError('A product with this name already exists', 409);

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      categoryId,
      brandId,
      description,
      shortDesc,
      price,
      listPrice,
      countInStock,
      sku,
      weight,
      images:      images || [],
      videos:      videos || [],
      tags:        tags   || [],
      isPublished: isPublished || false,
      isFeatured:  isFeatured  || false,
      metaTitle,
      metaDesc,
    },
    include: {
      category: true,
      brand: true,
    },
  });

  // Create color/size variants if provided
  if (colors?.length || sizes?.length) {
    const variantData = [];
    for (const color of colors || []) {
      variantData.push({ productId: product.id, name: 'Color', value: color });
    }
    for (const size of sizes || []) {
      variantData.push({ productId: product.id, name: 'Size', value: size });
    }
    await prisma.productVariant.createMany({ data: variantData });
  }

  await deleteCachePattern(CACHE_KEYS.PRODUCTS);
  return ApiResponse.created(res, product, 'Product created successfully');
}

// ─── Update Product (Admin) ───────────────────────────────────────────────────
export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new AppError('Product not found', 404);

  const {
    name, categoryId, brandId, description, shortDesc,
    price, listPrice, countInStock, sku, weight,
    images, videos, tags, isPublished, isFeatured,
    metaTitle, metaDesc,
  } = req.body;

  const slug = name ? slugify(name, { lower: true, strict: true }) : undefined;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name        !== undefined && { name }),
      ...(slug        !== undefined && { slug }),
      ...(categoryId  !== undefined && { categoryId }),
      ...(brandId     !== undefined && { brandId }),
      ...(description !== undefined && { description }),
      ...(shortDesc   !== undefined && { shortDesc }),
      ...(price       !== undefined && { price }),
      ...(listPrice   !== undefined && { listPrice }),
      ...(countInStock !== undefined && { countInStock }),
      ...(sku         !== undefined && { sku }),
      ...(weight      !== undefined && { weight }),
      ...(images      !== undefined && { images }),
      ...(videos      !== undefined && { videos }),
      ...(tags        !== undefined && { tags }),
      ...(isPublished !== undefined && { isPublished }),
      ...(isFeatured  !== undefined && { isFeatured }),
      ...(metaTitle   !== undefined && { metaTitle }),
      ...(metaDesc    !== undefined && { metaDesc }),
    },
    include: { category: true, brand: true },
  });

  await deleteCachePattern(CACHE_KEYS.PRODUCTS);
  await deleteCachePattern(`product:${existing.slug}`);

  return ApiResponse.success(res, product, 'Product updated successfully');
}

// ─── Delete Product (Admin) ───────────────────────────────────────────────────
export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found', 404);

  await prisma.product.delete({ where: { id } });

  await deleteCachePattern(CACHE_KEYS.PRODUCTS);
  await deleteCachePattern(`product:${product.slug}`);

  return ApiResponse.success(res, null, 'Product deleted successfully');
}

// ─── Admin: List ALL Products (including drafts) ─────────────────────────────
export async function adminListProducts(req: Request, res: Response) {
  const {
    page = '1',
    limit = '20',
    search,
    category,
    isPublished,
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Admin sees ALL products (no isPublished filter)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (isPublished !== undefined) where.isPublished = isPublished === 'true';
  if (category) where.category = { slug: category };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        listPrice: true,
        countInStock: true,
        isPublished: true,
        isFeatured: true,
        numSales: true,
        images: true,
        createdAt: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return ApiResponse.paginated(res, products, buildPagination(pageNum, limitNum, total));
}

// ─── Admin: Get Single Product by ID ─────────────────────────────────────────
export async function getProductById(req: Request, res: Response) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      variants: true,
    },
  });

  if (!product) throw new AppError('Product not found', 404);
  return ApiResponse.success(res, product);
}
export async function getFeaturedProducts(req: Request, res: Response) {
  const { limit = '8' } = req.query as Record<string, string>;

  const products = await prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    take: parseInt(limit),
    orderBy: { numSales: 'desc' },
    select: {
      id: true, name: true, slug: true, price: true,
      listPrice: true, images: true, avgRating: true,
      numReviews: true, countInStock: true,
    },
  });

  return ApiResponse.success(res, products);
}

// ─── Related Products ─────────────────────────────────────────────────────────
export async function getRelatedProducts(req: Request, res: Response) {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { categoryId: true, id: true },
  });
  if (!product) throw new AppError('Product not found', 404);

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isPublished: true,
    },
    take: 6,
    orderBy: { numSales: 'desc' },
    select: {
      id: true, name: true, slug: true, price: true,
      listPrice: true, images: true, avgRating: true, numReviews: true,
    },
  });

  return ApiResponse.success(res, related);
}

// ─── Track Browsing History ───────────────────────────────────────────────────
export async function trackBrowsingHistory(req: AuthRequest, res: Response) {
  const { productId } = req.body;
  if (!req.user) return ApiResponse.success(res, null);

  await prisma.browsingHistory.upsert({
    where: { userId_productId: { userId: req.user.userId, productId } },
    create: { userId: req.user.userId, productId },
    update: { viewedAt: new Date() },
  });

  return ApiResponse.success(res, null);
}

// ─── Get Browsing History ─────────────────────────────────────────────────────
export async function getBrowsingHistory(req: AuthRequest, res: Response) {
  const history = await prisma.browsingHistory.findMany({
    where: { userId: req.user!.userId },
    orderBy: { viewedAt: 'desc' },
    take: 20,
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, price: true,
          images: true, avgRating: true,
        },
      },
    },
  });

  return ApiResponse.success(res, history.map((h: { product: unknown }) => h.product));
}
