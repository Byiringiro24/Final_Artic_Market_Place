import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import slugify from 'slugify';

const router = Router();

// ─── Public: list active services ────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { category, featured } = req.query as Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true };
  if (category) where.category = category;
  if (featured === 'true') where.isFeatured = true;

  const services = await prisma.service.findMany({
    where,
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return ApiResponse.success(res, services);
});

// ─── Public: single service ───────────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { slug: req.params.slug, isActive: true },
  });
  if (!service) throw new AppError('Service not found', 404);
  return ApiResponse.success(res, service);
});

// ─── Admin: list all services ─────────────────────────────────────────────────
router.get('/admin/all', authenticate, authorize('ADMIN'), async (_req, res) => {
  const services = await prisma.service.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return ApiResponse.success(res, services);
});

// ─── Admin: create ────────────────────────────────────────────────────────────
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const { title, ...rest } = req.body;
  const slug = slugify(title, { lower: true, strict: true });
  const existing = await prisma.service.findUnique({ where: { slug } });
  if (existing) throw new AppError('A service with this title already exists', 409);
  const service = await prisma.service.create({
    data: { title, slug, ...rest },
  });
  return ApiResponse.created(res, service);
});

// ─── Admin: update ────────────────────────────────────────────────────────────
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const { title, ...rest } = req.body;
  const slug = title ? slugify(title, { lower: true, strict: true }) : undefined;
  const service = await prisma.service.update({
    where: { id: req.params.id },
    data: { ...(title && { title, slug }), ...rest },
  });
  return ApiResponse.success(res, service);
});

// ─── Admin: delete ────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.service.delete({ where: { id: req.params.id } });
  return ApiResponse.success(res, null, 'Service deleted');
});

export default router;
