import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Update profile
router.put('/profile', async (req: AuthRequest, res) => {
  const { name, image, phoneNumber } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { name, image, phoneNumber },
    select: { id: true, name: true, email: true, image: true, phoneNumber: true },
  });
  return ApiResponse.success(res, user, 'Profile updated');
});

// ─── Addresses ────────────────────────────────────────────────────────────────
router.get('/addresses', async (req: AuthRequest, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return ApiResponse.success(res, addresses);
});

router.post('/addresses', async (req: AuthRequest, res) => {
  const { isDefault, ...data } = req.body;

  // If setting as default, unset all others
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user!.userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: { ...data, userId: req.user!.userId, isDefault: isDefault || false },
  });
  return ApiResponse.created(res, address);
});

router.put('/addresses/:id', async (req: AuthRequest, res) => {
  const address = await prisma.address.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!address) throw new AppError('Address not found', 404);

  if (req.body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user!.userId },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return ApiResponse.success(res, updated);
});

router.delete('/addresses/:id', async (req: AuthRequest, res) => {
  const address = await prisma.address.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!address) throw new AppError('Address not found', 404);

  await prisma.address.delete({ where: { id: req.params.id } });
  return ApiResponse.success(res, null, 'Address deleted');
});

export default router;
