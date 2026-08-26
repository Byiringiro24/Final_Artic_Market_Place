import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrder,
  adminListOrders, updateOrderStatus,
  cancelOrder, submitPaymentProof, adminMarkPaid,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// ─── Proof upload multer (users uploading MoMo screenshots) ─────────────────
const proofsDir = path.join(process.cwd(), 'uploads', 'proofs');
if (!fs.existsSync(proofsDir)) fs.mkdirSync(proofsDir, { recursive: true });

const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError('Only JPEG, PNG, WebP images allowed for payment proof', 400) as unknown as null, false);
    }
    cb(null, true);
  },
});

// ─── User routes ─────────────────────────────────────────────────────────────
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrder);

// Cancel own order (PENDING or CONFIRMED only)
router.post('/:id/cancel', authenticate, cancelOrder);

// Submit MoMo payment proof — USER uploads screenshot
router.post(
  '/:id/payment-proof',
  authenticate,
  proofUpload.single('proof'),
  async (req, res, next) => {
    try {
      if (!req.file) throw new AppError('No image file uploaded', 400);

      // Convert to WebP and save
      const filename = `proof-${uuidv4()}.webp`;
      const outputPath = path.join(proofsDir, filename);
      await sharp(req.file.buffer)
        .resize(1800, 1800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(outputPath);

      // Attach URL to request body for the controller
      const proofUrl = `${process.env.APP_URL}/uploads/proofs/${filename}`;
      (req as unknown as { proofUrl: string }).proofUrl = proofUrl;

      next();
    } catch (err) {
      next(err);
    }
  },
  submitPaymentProof,
);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get('/', authenticate, authorize('ADMIN'), adminListOrders);
router.put('/:id/status', authenticate, authorize('ADMIN'), updateOrderStatus);
router.put('/:id/mark-paid', authenticate, authorize('ADMIN'), adminMarkPaid);

export default router;
