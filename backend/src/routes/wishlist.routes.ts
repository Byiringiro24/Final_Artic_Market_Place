import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.userId },
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, price: true,
          listPrice: true, images: true, avgRating: true, countInStock: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return ApiResponse.success(res, items);
});

router.post('/', async (req: AuthRequest, res) => {
  const { productId } = req.body;

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: req.user!.userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return ApiResponse.success(res, { added: false }, 'Removed from wishlist');
  }

  const item = await prisma.wishlistItem.create({
    data: { userId: req.user!.userId, productId },
  });
  return ApiResponse.created(res, { added: true, item }, 'Added to wishlist');
});

router.delete('/:productId', async (req: AuthRequest, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user!.userId, productId: req.params.productId },
  });
  return ApiResponse.success(res, null, 'Removed from wishlist');
});

export default router;
