import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { ApiResponse } from '../lib/apiResponse';
import { prisma } from '../db/prisma';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return ApiResponse.unauthorized(res, 'Access token required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    return ApiResponse.unauthorized(res, 'Invalid or expired access token');
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res);
    }
    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'Insufficient permissions');
    }
    next();
  };
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyAccessToken(token);
  } catch {
    // No-op — optional
  }
  next();
}

// Verify user is active in DB (for sensitive operations)
export async function verifyActiveUser(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return ApiResponse.unauthorized(res);

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { isActive: true, emailVerified: true },
  });

  if (!user || !user.isActive) {
    return ApiResponse.forbidden(res, 'Account has been deactivated');
  }

  next();
}
