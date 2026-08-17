import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts,
  trackBrowsingHistory,
  getBrowsingHistory,
  adminListProducts,
  getProductById,
} from '../controllers/product.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/', listProducts);
router.get('/featured', getFeaturedProducts);

// ─── Admin: list all products (including drafts) — must come before /:slug ───
router.get('/admin/all', authenticate, authorize('ADMIN'), adminListProducts);

// ─── Authenticated user routes ────────────────────────────────────────────────
router.post('/browsing-history', authenticate, trackBrowsingHistory);
router.get('/me/browsing-history', authenticate, getBrowsingHistory);

// ─── Admin: get/update/delete by ID ──────────────────────────────────────────
router.get('/id/:id', authenticate, authorize('ADMIN'), getProductById);
router.put('/:id', authenticate, authorize('ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

// ─── Admin: create ────────────────────────────────────────────────────────────
router.post('/', authenticate, authorize('ADMIN'), createProduct);

// ─── Public: product detail by slug (must be last) ───────────────────────────
router.get('/:slug/related', getRelatedProducts);
router.get('/:slug', optionalAuth, getProduct);

export default router;
