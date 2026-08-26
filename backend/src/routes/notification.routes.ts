import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { registerAdminSseClient, removeAdminSseClient } from '../controllers/order.controller';
import { verifyAccessToken } from '../lib/jwt';

const router = Router();
router.use(authenticate);

// ─── SSE stream for real-time admin notifications ─────────────────────────────
// EventSource cannot set Authorization headers, so we accept token as query param
router.get('/stream', (req: AuthRequest, res) => {
  // Allow token via query string for EventSource (browser limitation)
  if (!req.user) {
    const token = req.query.token as string;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
      const payload = verifyAccessToken(token);
      if (payload.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Forbidden' });
      req.user = { userId: payload.userId, email: payload.email, role: payload.role };
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } else if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const userId = req.user.userId;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'PING' })}\n\n`);
  registerAdminSseClient(userId, res);

  const keepalive = setInterval(() => {
    try { res.write(`data: ${JSON.stringify({ type: 'PING' })}\n\n`); } catch { /* ignore */ }
  }, 25000);

  req.on('close', () => {
    clearInterval(keepalive);
    removeAdminSseClient(userId);
  });
});

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
