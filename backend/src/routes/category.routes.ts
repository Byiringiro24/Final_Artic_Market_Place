import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getCache, setCache, deleteCache, CACHE_KEYS } from '../lib/redis';
import slugify from 'slugify';

const router = Router();

// GET /categories — all active categories with tree structure
router.get('/', async (_req, res) => {
  const cached = await getCache(CACHE_KEYS.CATEGORIES);
  if (cached) return ApiResponse.success(res, cached);

  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: {
      children: {
        where: { isActive: true },
        include: { children: { where: { isActive: true } } },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  await setCache(CACHE_KEYS.CATEGORIES, categories, 600);
  return ApiResponse.success(res, categories);
});

// GET /categories/:slug
router.get('/:slug', async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: { children: { where: { isActive: true } } },
  });
  if (!category) throw new AppError('Category not found', 404);
  return ApiResponse.success(res, category);
});

// POST /categories (Admin)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const { name, description, image, icon, parentId, sortOrder } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const category = await prisma.category.create({
    data: { name, slug, description, image, icon, parentId, sortOrder },
  });

  await deleteCache(CACHE_KEYS.CATEGORIES);
  return ApiResponse.created(res, category);
});

// PUT /categories/:id (Admin)
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const { name, ...rest } = req.body;
  const slug = name ? slugify(name, { lower: true, strict: true }) : undefined;

  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { ...(name && { name, slug }), ...rest },
  });

  await deleteCache(CACHE_KEYS.CATEGORIES);
  return ApiResponse.success(res, category);
});

// DELETE /categories/:id (Admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.category.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  await deleteCache(CACHE_KEYS.CATEGORIES);
  return ApiResponse.success(res, null, 'Category deactivated');
});

export default router;
