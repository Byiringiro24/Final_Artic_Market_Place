import { Router } from 'express';
import { getDashboardStats, listUsers, updateUser } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', listUsers);
router.put('/users/:id', updateUser);

export default router;
