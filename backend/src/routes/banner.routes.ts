import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getCache, setCache, deleteCache, CACHE_KEYS } from '../lib/redis';

const router = Router();

router.get('/', async (_req, res) => {
  const cached = await getCache(CACHE_KEYS.BANNERS);
  if (cached) return ApiResponse.success(res, cached);

  const banners = await prisma.banner.findMany({
    where: {
      isActive: true,
      OR: [{ startDate: null }, { startDate: { lte: new Date() } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }],
    },
    orderBy: { sortOrder: 'asc' },
  });
  await setCache(CACHE_KEYS.BANNERS, banners, 300);
  return ApiResponse.success(res, banners);
});

router.get('/all', authenticate, authorize('ADMIN'), async (_req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  return ApiResponse.success(res, banners);
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const banner = await prisma.banner.create({ data: req.body });
  await deleteCache(CACHE_KEYS.BANNERS);
  return ApiResponse.created(res, banner);
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const banner = await prisma.banner.update({
    where: { id: req.params.id },
    data: req.body,
  });
  await deleteCache(CACHE_KEYS.BANNERS);
  return ApiResponse.success(res, banner);
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  await deleteCache(CACHE_KEYS.BANNERS);
  return ApiResponse.success(res, null, 'Banner deleted');
});

export default router;
