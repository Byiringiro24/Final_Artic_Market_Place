import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Strict for login/register
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip || 'unknown',
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    });
  },
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  message: { success: false, message: 'Action limit exceeded. Try again in 1 hour.' },
});
