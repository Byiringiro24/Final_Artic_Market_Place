import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Validate coupon (public — needed at checkout)
router.post('/validate', authenticate, async (req: AuthRequest, res) => {
  const { code, orderAmount } = req.body;
  const normalizedCode = String(code || '').trim().toUpperCase();
  const amount = Number(orderAmount);
  if (!normalizedCode || !Number.isFinite(amount) || amount < 0) {
    throw new AppError('A valid coupon code and order amount are required', 400);
  }

  const coupon = await prisma.promotion.findFirst({
    where: {
      code: normalizedCode,
      isActive: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
        { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
      ],
    },
  });

  if (!coupon) throw new AppError('Invalid or expired coupon code', 404);
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new AppError('This coupon has reached its usage limit', 400);
  }
  if (amount < Number(coupon.minOrderAmount)) {
    throw new AppError(
      `Minimum order amount of $${coupon.minOrderAmount} required`,
      400
    );
  }
  const userUses = await prisma.order.count({
    where: { userId: req.user!.userId, couponCode: coupon.code },
  });
  if (coupon.perUserLimit > 0 && userUses >= coupon.perUserLimit) {
    throw new AppError('You have reached the use limit for this coupon', 400);
  }

  return ApiResponse.success(res, {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    maxDiscountAmount: coupon.maxDiscountAmount,
  });
});

// Admin CRUD
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return ApiResponse.success(res, promotions);
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const promo = await prisma.promotion.create({
    data: { ...req.body, code: req.body.code.toUpperCase() },
  });
  return ApiResponse.created(res, promo);
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const promo = await prisma.promotion.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return ApiResponse.success(res, promo);
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.promotion.delete({ where: { id: req.params.id } });
  return ApiResponse.success(res, null, 'Promotion deleted');
});

export default router;
