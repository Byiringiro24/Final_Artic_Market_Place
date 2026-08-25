import { Router } from 'express';
import { getDashboardStats, listUsers, updateUser, listAdminProducts, listAdminOrders } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', listUsers);
router.put('/users/:id', updateUser);

// Products (admin view — all products including unpublished)
router.get('/products', listAdminProducts);

// Orders (admin view — all orders from all users)
router.get('/orders', listAdminOrders);

export default router;
