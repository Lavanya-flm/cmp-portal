import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../errors/AppError';
import { ErrorCode } from '../errors/AppError';
import { JwtAccessPayload, AuthenticatedUser, AuthRequest } from '../types';
import { Request } from 'express';

/**
 * Verifies the JWT access token from the Authorization header.
 * Attaches the decoded user to req.user.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided', ErrorCode.TOKEN_MISSING));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as JwtAccessPayload;

    const user: AuthenticatedUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Access token expired', ErrorCode.TOKEN_EXPIRED));
    }
    return next(new UnauthorizedError('Invalid access token', ErrorCode.TOKEN_INVALID));
  }
}

/**
 * Optional authentication — populates req.user if a valid token exists,
 * but does not block unauthenticated requests.
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as JwtAccessPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
}

/**
 * Type guard — narrows Request to AuthRequest inside route handlers.
 */
export function assertAuthenticated(req: Request): asserts req is AuthRequest {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }
}
