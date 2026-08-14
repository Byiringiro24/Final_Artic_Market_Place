import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../db/prisma';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailVerifyToken,
  signPasswordResetToken,
  verifyEmailToken,
  verifyResetToken,
} from '../lib/jwt';
import { sendEmail } from '../lib/email';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../lib/logger';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── Register ─────────────────────────────────────────────────────────────────
export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email is already registered', 409);
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, image: true },
  });

  // Send verification email
  const token = signEmailVerifyToken(user.id);
  await prisma.emailVerifyToken.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    update: {
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    toName: name,
    subject: 'Verify your ARTIC Marketplace email',
    template: 'email-verification',
    html: `
      <h1>Welcome to ARTIC Marketplace, ${name}!</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}" style="background:#f90;padding:12px 24px;color:#000;text-decoration:none;border-radius:4px;">Verify Email</a>
      <p>Link expires in 24 hours.</p>
    `,
  });

  return ApiResponse.created(res, user, 'Account created. Please verify your email.');
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact support.', 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Persist refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

  logger.info(`User logged in: ${email}`);

  return ApiResponse.success(res, {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      emailVerified: user.emailVerified,
    },
  });
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
export async function refreshToken(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Refresh token not found', 401);

  const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const payload = verifyRefreshToken(token);
  const newAccessToken = signAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });

  return ApiResponse.success(res, { accessToken: newAccessToken });
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
  res.clearCookie('refreshToken');
  return ApiResponse.success(res, null, 'Logged out successfully');
}

// ─── Verify Email ─────────────────────────────────────────────────────────────
export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.body;

  let payload: { userId: string };
  try {
    payload = verifyEmailToken(token);
  } catch {
    throw new AppError('Invalid or expired verification link', 400);
  }

  const record = await prisma.emailVerifyToken.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Verification link has expired', 400);
  }

  await prisma.user.update({
    where: { id: payload.userId },
    data: { emailVerified: true },
  });

  await prisma.emailVerifyToken.delete({ where: { token } });

  return ApiResponse.success(res, null, 'Email verified successfully');
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return 200 to prevent email enumeration
  if (!user) {
    return ApiResponse.success(res, null, 'If this email exists, a reset link has been sent.');
  }

  const token = signPasswordResetToken(user.id);
  await prisma.passwordResetToken.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
    update: {
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    toName: user.name,
    subject: 'Reset your ARTIC Marketplace password',
    template: 'password-reset',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.name}, click below to reset your password:</p>
      <a href="${resetUrl}" style="background:#f90;padding:12px 24px;color:#000;text-decoration:none;border-radius:4px;">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request this, ignore it.</p>
    `,
  });

  return ApiResponse.success(res, null, 'If this email exists, a reset link has been sent.');
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;

  let payload: { userId: string };
  try {
    payload = verifyResetToken(token);
  } catch {
    throw new AppError('Invalid or expired reset link', 400);
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Reset link has expired', 400);
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  const hashed = await bcrypt.hash(password, saltRounds);

  await prisma.user.update({
    where: { id: payload.userId },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  // Invalidate all refresh tokens for security
  await prisma.refreshToken.deleteMany({ where: { userId: payload.userId } });

  return ApiResponse.success(res, null, 'Password has been reset successfully.');
}

// ─── Get Me ───────────────────────────────────────────────────────────────────
export async function getMe(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      phoneNumber: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { orders: true, reviews: true, wishlist: true } },
    },
  });

  if (!user) throw new AppError('User not found', 404);
  return ApiResponse.success(res, user);
}

// ─── Change Password ──────────────────────────────────────────────────────────
export async function changePassword(req: AuthRequest, res: Response) {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user?.password) throw new AppError('No password set for this account', 400);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError('Current password is incorrect', 400);

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  const hashed = await bcrypt.hash(newPassword, saltRounds);

  await prisma.user.update({
    where: { id: req.user!.userId },
    data: { password: hashed },
  });

  return ApiResponse.success(res, null, 'Password updated successfully.');
}
