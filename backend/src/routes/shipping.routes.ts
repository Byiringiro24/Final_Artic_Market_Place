import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/zones', async (_req, res) => {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    include: { rates: { where: { isActive: true } } },
  });
  return ApiResponse.success(res, zones);
});

router.post('/zones', authenticate, authorize('ADMIN'), async (req, res) => {
  const zone = await prisma.shippingZone.create({
    data: req.body,
    include: { rates: true },
  });
  return ApiResponse.created(res, zone);
});

router.put('/zones/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const zone = await prisma.shippingZone.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return ApiResponse.success(res, zone);
});

router.delete('/zones/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.shippingZone.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  return ApiResponse.success(res, null, 'Shipping zone deactivated');
});

router.post('/zones/:zoneId/rates', authenticate, authorize('ADMIN'), async (req, res) => {
  const rate = await prisma.shippingRate.create({
    data: { ...req.body, zoneId: req.params.zoneId },
  });
  return ApiResponse.created(res, rate);
});

export default router;
