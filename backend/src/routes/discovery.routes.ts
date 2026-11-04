import { Router } from 'express';
import { CourseStatus } from '@prisma/client';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';

const router = Router();

// Search only public, currently available records across the live hub.
router.get('/search', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  if (query.length < 2) return ApiResponse.success(res, { products: [], services: [], courses: [] });

  const [products, services, courses] = await Promise.all([
    prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { shortDesc: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      take: 8,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, name: true, slug: true, shortDesc: true, category: { select: { name: true } } },
    }),
    prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { shortDesc: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 8,
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
      select: { id: true, title: true, slug: true, shortDesc: true, category: true },
    }),
    prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 8,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      select: { id: true, title: true, slug: true, summary: true, category: true },
    }),
  ]);

  return ApiResponse.success(res, { products, services, courses });
});

export default router;
