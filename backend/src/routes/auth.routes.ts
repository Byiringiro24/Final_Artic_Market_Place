import { Router } from 'express';
import {
  register, login, logout, refreshToken,
  verifyEmail, forgotPassword, resetPassword,
  googleLogin, getMe, changePassword, updatePreferences,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter, strictLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', googleLogin);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', strictLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);
router.patch('/preferences', authenticate, updatePreferences);

export default router;
