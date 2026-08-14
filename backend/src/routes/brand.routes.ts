import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getCache, setCache, deleteCache, CACHE_KEYS } from '../lib/redis';
import slugify from 'slugify';

const router = Router();

router.get('/', async (_req, res) => {
  const cached = await getCache(CACHE_KEYS.BRANDS);
  if (cached) return ApiResponse.success(res, cached);

  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  await setCache(CACHE_KEYS.BRANDS, brands, 600);
  return ApiResponse.success(res, brands);
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const { name, logo, description } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const brand = await prisma.brand.create({ data: { name, slug, logo, description } });
  await deleteCache(CACHE_KEYS.BRANDS);
  return ApiResponse.created(res, brand);
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const brand = await prisma.brand.update({
    where: { id: req.params.id },
    data: req.body,
  });
  await deleteCache(CACHE_KEYS.BRANDS);
  return ApiResponse.success(res, brand);
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.brand.update({ where: { id: req.params.id }, data: { isActive: false } });
  await deleteCache(CACHE_KEYS.BRANDS);
  return ApiResponse.success(res, null, 'Brand deactivated');
});

export default router;
