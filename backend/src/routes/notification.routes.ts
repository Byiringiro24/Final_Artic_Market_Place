import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: req.user!.userId, isRead: false },
  });
  return ApiResponse.success(res, { notifications, unreadCount });
});

router.put('/read-all', async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });
  return ApiResponse.success(res, null, 'All marked as read');
});

router.put('/:id/read', async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.userId },
    data: { isRead: true },
  });
  return ApiResponse.success(res, null);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.notification.deleteMany({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  return ApiResponse.success(res, null);
});

export default router;
