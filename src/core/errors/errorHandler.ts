import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ErrorCode, ValidationErrorDetail } from './AppError';
import { logger } from '../logger';
import { env } from '../../config/env';

interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  code: ErrorCode | string;
  requestId: string;
  errors?: ValidationErrorDetail[];
  stack?: string;
}

// ─── Map Prisma errors to AppErrors ──────────────────────────────────────────
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002': {
      const fields = (error.meta?.target as string[])?.join(', ') ?? 'field';
      return new AppError(`Duplicate value for: ${fields}`, 409, ErrorCode.CONFLICT);
    }
    case 'P2025':
      return new AppError('Record not found', 404, ErrorCode.NOT_FOUND);
    case 'P2003':
      return new AppError('Foreign key constraint failed', 400, ErrorCode.BAD_REQUEST);
    case 'P2014':
      return new AppError('Relation violation', 400, ErrorCode.BAD_REQUEST);
    default:
      return new AppError('Database operation failed', 500, ErrorCode.DATABASE_ERROR, false);
  }
}

// ─── Central error handler middleware ─────────────────────────────────────────
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = (req.headers['x-request-id'] as string) ?? 'unknown';

  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(error);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    appError = new AppError('Invalid data provided', 400, ErrorCode.BAD_REQUEST);
  } else if (error.name === 'JsonWebTokenError') {
    appError = new AppError('Invalid token', 401, ErrorCode.TOKEN_INVALID);
  } else if (error.name === 'TokenExpiredError') {
    appError = new AppError('Token expired', 401, ErrorCode.TOKEN_EXPIRED);
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    appError = new AppError('Invalid JSON in request body', 400, ErrorCode.BAD_REQUEST);
  } else {
    appError = new AppError('Internal server error', 500, ErrorCode.INTERNAL_SERVER_ERROR, false);
  }

  // Log based on severity
  if (appError.statusCode >= 500) {
    logger.error('Unhandled error', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: appError.statusCode,
      code: appError.code,
      message: appError.message,
      stack: appError.stack,
      originalError: !appError.isOperational ? error.message : undefined,
    });
  } else {
    logger.warn('Client error', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: appError.statusCode,
      code: appError.code,
      message: appError.message,
    });
  }

  const response: ErrorResponse = {
    success: false,
    statusCode: appError.statusCode,
    message: appError.isOperational ? appError.message : 'Something went wrong',
    code: appError.code,
    requestId,
  };

  if (appError.details?.length) {
    response.errors = appError.details;
  }

  if (env.nodeEnv === 'development' && appError.stack) {
    response.stack = appError.stack;
  }

  res.status(appError.statusCode).json(response);
}

// ─── 404 handler ─────────────────────────────────────────────────────────────
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route ${req.originalUrl} not found`, 404, ErrorCode.NOT_FOUND));
}
