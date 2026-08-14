import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse, buildPagination } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── Get Product Reviews ──────────────────────────────────────────────────────
export async function getProductReviews(req: Request, res: Response) {
  const { productId } = req.params;
  const { page = '1', limit = '10', rating, sort = 'newest' } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { productId, status: 'APPROVED' };
  if (rating) where.rating = parseInt(rating);

  const sortMap: Record<string, object> = {
    newest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    helpful: { helpfulCount: 'desc' },
    highest: { rating: 'desc' },
    lowest: { rating: 'asc' },
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: sortMap[sort] || { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  // Rating distribution
  const distribution = await prisma.review.groupBy({
    by: ['rating'],
    where: { productId, status: 'APPROVED' },
    _count: { rating: true },
  });

  return ApiResponse.paginated(
    res,
    { reviews, distribution },
    buildPagination(pageNum, limitNum, total)
  );
}

// ─── Create Review ────────────────────────────────────────────────────────────
export async function createReview(req: AuthRequest, res: Response) {
  const { productId, rating, title, comment, images } = req.body;
  const userId = req.user!.userId;

  // Check if already reviewed
  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
  if (existing) throw new AppError('You have already reviewed this product', 409);

  // Check verified purchase
  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: 'DELIVERED' },
    },
  });

  const review = await prisma.review.create({
    data: {
      productId,
      userId,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: !!purchase,
      status: 'PENDING',
    },
    include: {
      user: { select: { name: true, image: true } },
    },
  });

  return ApiResponse.created(res, review, 'Review submitted and awaiting approval');
}

// ─── Admin: List Reviews for Moderation ───────────────────────────────────────
export async function adminListReviews(req: Request, res: Response) {
  const { page = '1', limit = '20', status } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status) where.status = status.toUpperCase();

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return ApiResponse.paginated(res, reviews, buildPagination(pageNum, limitNum, total));
}

// ─── Admin: Approve/Reject Review ─────────────────────────────────────────────
export async function moderateReview(req: Request, res: Response) {
  const { id } = req.params;
  const { status, adminReply } = req.body;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError('Review not found', 404);

  const updated = await prisma.review.update({
    where: { id },
    data: {
      status,
      ...(adminReply && { adminReply, adminReplyAt: new Date() }),
    },
  });

  if (status === 'APPROVED') {
    // Recompute product avg rating
    const stats = await prisma.review.aggregate({
      where: { productId: review.productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        avgRating: stats._avg.rating || 0,
        numReviews: stats._count.rating,
      },
    });
  }

  return ApiResponse.success(res, updated, 'Review moderated');
}
