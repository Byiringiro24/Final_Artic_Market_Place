import { Router } from 'express';
import {
  getProductReviews, createReview,
  adminListReviews, moderateReview,
} from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authenticate, createReview);

// Admin
router.get('/', authenticate, authorize('ADMIN'), adminListReviews);
router.put('/:id/moderate', authenticate, authorize('ADMIN'), moderateReview);

export default router;
