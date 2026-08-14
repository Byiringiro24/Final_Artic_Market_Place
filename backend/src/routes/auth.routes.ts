import { Router } from 'express';
import {
  register, login, logout, refreshToken,
  verifyEmail, forgotPassword, resetPassword,
  getMe, changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter, strictLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', strictLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

export default router;
