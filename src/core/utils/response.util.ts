import { Response } from 'express';
import { ApiResponse, PaginatedResponse, PaginationMeta } from '../types';

/**
 * Send a standardized success response.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
): Response<ApiResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
}

/**
 * Send a standardized paginated response.
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message = 'Success',
): Response<PaginatedResponse<T>> {
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message,
    data,
    meta,
  });
}

/**
 * Build a PaginationMeta object.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
