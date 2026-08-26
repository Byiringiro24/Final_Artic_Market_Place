import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import slugify from 'slugify';

const router = Router();

router.get('/', async (_req, res) => {
  const pages = await prisma.webPage.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, title: true, slug: true, sortOrder: true },
  });
  return ApiResponse.success(res, pages);
});

// Admin routes MUST come before /:slug to avoid slug capture
router.get('/admin/all', authenticate, authorize('ADMIN'), async (_req, res) => {
  const pages = await prisma.webPage.findMany({ orderBy: { sortOrder: 'asc' } });
  return ApiResponse.success(res, pages);
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const { title, content, isPublished, metaTitle, metaDesc, sortOrder } = req.body;
  const slug = slugify(title, { lower: true, strict: true });

  const page = await prisma.webPage.create({
    data: { title, slug, content, isPublished, metaTitle, metaDesc, sortOrder },
  });
  return ApiResponse.created(res, page);
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const { title, ...rest } = req.body;
  const slug = title ? slugify(title, { lower: true, strict: true }) : undefined;

  const page = await prisma.webPage.update({
    where: { id: req.params.id },
    data: { ...(title && { title, slug }), ...rest },
  });
  return ApiResponse.success(res, page);
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.webPage.delete({ where: { id: req.params.id } });
  return ApiResponse.success(res, null, 'Page deleted');
});

// Public: get single page by slug (must be last — catches all /:slug)
router.get('/:slug', async (req, res) => {
  const page = await prisma.webPage.findUnique({
    where: { slug: req.params.slug, isPublished: true },
  });
  if (!page) throw new AppError('Page not found', 404);
  return ApiResponse.success(res, page);
});

export default router;
