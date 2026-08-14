import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getCache, setCache, deleteCache, CACHE_KEYS } from '../lib/redis';

const router = Router();

// GET /settings — public (read only site-level settings)
router.get('/', async (_req, res) => {
  const cached = await getCache(CACHE_KEYS.SETTINGS);
  if (cached) return ApiResponse.success(res, cached);

  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  await setCache(CACHE_KEYS.SETTINGS, map, 600);
  return ApiResponse.success(res, map);
});

// GET /settings/:group — settings by group
router.get('/:group', authenticate, authorize('ADMIN'), async (req, res) => {
  const settings = await prisma.setting.findMany({
    where: { group: req.params.group },
  });
  return ApiResponse.success(res, settings);
});

// PUT /settings — bulk update (admin)
router.put('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const updates = req.body as Array<{ key: string; value: unknown; group: string; label?: string }>;

  await Promise.all(
    updates.map((s) =>
      prisma.setting.upsert({
        where: { key: s.key },
        create: { key: s.key, value: s.value as never, group: s.group, label: s.label },
        update: { value: s.value as never, label: s.label },
      })
    )
  );

  await deleteCache(CACHE_KEYS.SETTINGS);
  return ApiResponse.success(res, null, 'Settings saved');
});

export default router;
