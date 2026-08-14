/**
 * Auth helper utilities for server components
 */
import { cookies } from 'next/headers';

/**
 * Get the access token from cookies (server-side).
 * Access token is stored in localStorage client-side,
 * so for server components we rely on the refresh token cookie
 * and let the API client handle token refresh.
 */
export async function getServerSession(): Promise<{
  userId: string;
  role: string;
} | null> {
  // In this architecture, auth is fully client-side JWT.
  // Server components can read the cookie if needed,
  // but most auth checks happen in the API routes.
  return null;
}

/**
 * Utility to check if a role has admin access
 */
export function isAdminRole(role: string): boolean {
  return role === 'ADMIN';
}

/**
 * Generate a secure random string for secrets
 * Usage: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
 */
export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  EMAIL_TOKEN_EXPIRY: '24h',
  RESET_TOKEN_EXPIRY: '1h',
  BCRYPT_ROUNDS: 12,
} as const;
