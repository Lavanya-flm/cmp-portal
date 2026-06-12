import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';
import { TooManyRequestsError } from '../errors/AppError';

/**
 * Global rate limiter — applies to all routes.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many requests, please try again later'));
  },
});

/**
 * Strict rate limiter — for sensitive endpoints like login, register, password reset.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many authentication attempts, please try again later'));
  },
});
