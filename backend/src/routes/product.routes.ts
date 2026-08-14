import { Router } from 'express';
import {
  listProducts, getProduct, createProduct,
  updateProduct, deleteProduct, getFeaturedProducts,
  getRelatedProducts, trackBrowsingHistory, getBrowsingHistory,
} from '../controllers/product.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', listProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', optionalAuth, getProduct);
router.get('/:slug/related', getRelatedProducts);

// Authenticated
router.post('/browsing-history', authenticate, trackBrowsingHistory);
router.get('/me/browsing-history', authenticate, getBrowsingHistory);

// Admin only
router.post('/', authenticate, authorize('ADMIN'), createProduct);
router.put('/:id', authenticate, authorize('ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;
