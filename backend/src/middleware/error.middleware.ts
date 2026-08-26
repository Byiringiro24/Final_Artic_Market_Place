import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  logger.error(err);

  // Operational / known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = Array.isArray(err.meta?.target)
        ? (err.meta.target as string[]).join(', ')
        : String(err.meta?.target ?? 'value');
      const fieldLabel = field.includes('slug') ? 'product name (slug)'
        : field.includes('sku') ? 'SKU'
        : field.includes('email') ? 'email'
        : field;
      return res.status(409).json({
        success: false,
        message: `A record with this ${fieldLabel} already exists. Please use a different value.`,
        field,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Database error',
      code: err.code,
    });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided',
    });
  }

  // JWT errors
  if (err instanceof TokenExpiredError) {
    return res.status(401).json({ success: false, message: 'Token has expired' });
  }
  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Fallback for unexpected errors
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
