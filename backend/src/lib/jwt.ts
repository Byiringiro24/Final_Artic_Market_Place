import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });
}

export function signEmailVerifyToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_EMAIL_VERIFY_SECRET as string, {
    expiresIn: (process.env.JWT_EMAIL_VERIFY_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'],
  });
}

export function signPasswordResetToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_RESET_SECRET as string, {
    expiresIn: (process.env.JWT_RESET_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload;
}

export function verifyEmailToken(token: string): { userId: string } {
  return jwt.verify(token, process.env.JWT_EMAIL_VERIFY_SECRET as string) as { userId: string };
}

export function verifyResetToken(token: string): { userId: string } {
  return jwt.verify(token, process.env.JWT_RESET_SECRET as string) as { userId: string };
}
