import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrder,
  adminListOrders, updateOrderStatus,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// User routes
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrder);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), adminListOrders);
router.put('/:id/status', authenticate, authorize('ADMIN'), updateOrderStatus);

export default router;
