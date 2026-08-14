import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', async (_req, res) => {
  const taxes = await prisma.taxRule.findMany({ where: { isActive: true } });
  return ApiResponse.success(res, taxes);
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const rule = await prisma.taxRule.create({ data: req.body });
  return ApiResponse.created(res, rule);
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const rule = await prisma.taxRule.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return ApiResponse.success(res, rule);
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.taxRule.update({ where: { id: req.params.id }, data: { isActive: false } });
  return ApiResponse.success(res, null, 'Tax rule deactivated');
});

export default router;
