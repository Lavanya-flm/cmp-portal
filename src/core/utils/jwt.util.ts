import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { JwtAccessPayload, JwtRefreshPayload, Role } from '../types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

/**
 * Generate an access + refresh token pair for an authenticated user.
 */
export function generateTokenPair(userId: string, email: string, role: Role): TokenPair {
  const sessionId = uuidv4();

  const accessPayload: Omit<JwtAccessPayload, 'iat' | 'exp'> = {
    sub: userId,
    email,
    role,
    sessionId,
  };

  const refreshPayload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
    sub: userId,
    sessionId,
  };

  const accessToken = jwt.sign(accessPayload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(refreshPayload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken, sessionId };
}

/**
 * Verify and decode a refresh token.
 */
export function verifyRefreshToken(token: string): JwtRefreshPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as JwtRefreshPayload;
}

/**
 * Decode a token without verification (for logging/debugging only — never trust this for auth).
 */
export function decodeToken(token: string): JwtAccessPayload | JwtRefreshPayload | null {
  return jwt.decode(token) as JwtAccessPayload | JwtRefreshPayload | null;
}
