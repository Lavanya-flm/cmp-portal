import { Request } from 'express';

// ─── RBAC ─────────────────────────────────────────────────────────────────────

/**
 * Three-tier role hierarchy:
 *
 *  SUPER_ADMIN — full access: create / edit / delete / view on all modules
 *  SUB_ADMIN   — restricted: create / edit / view only (no delete)
 *  USER        — read-only: view only
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUB_ADMIN   = 'SUB_ADMIN',
  USER        = 'USER',
}

export enum Permission {
  // ── Courses ────────────────────────────────────────────────
  COURSE_CREATE = 'course:create',
  COURSE_READ   = 'course:read',
  COURSE_UPDATE = 'course:update',
  COURSE_DELETE = 'course:delete',

  // ── Batches ────────────────────────────────────────────────
  BATCH_CREATE  = 'batch:create',
  BATCH_READ    = 'batch:read',
  BATCH_UPDATE  = 'batch:update',
  BATCH_DELETE  = 'batch:delete',

  // ── Trainers ───────────────────────────────────────────────
  TRAINER_CREATE = 'trainer:create',
  TRAINER_READ   = 'trainer:read',
  TRAINER_UPDATE = 'trainer:update',
  TRAINER_DELETE = 'trainer:delete',

  // ── Batch Links ────────────────────────────────────────────
  LINKS_CREATE  = 'links:create',
  LINKS_READ    = 'links:read',
  LINKS_UPDATE  = 'links:update',
  LINKS_DELETE  = 'links:delete',
}

// ─── Role → Permission matrix ─────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {

  /**
   * SUPER_ADMIN — unrestricted access to every permission.
   */
  [Role.SUPER_ADMIN]: Object.values(Permission),

  /**
   * SUB_ADMIN — create / edit / view across all modules.
   * No delete permission on any module.
   */
  [Role.SUB_ADMIN]: [
    Permission.COURSE_CREATE,
    Permission.COURSE_READ,
    Permission.COURSE_UPDATE,

    Permission.BATCH_CREATE,
    Permission.BATCH_READ,
    Permission.BATCH_UPDATE,

    Permission.TRAINER_CREATE,
    Permission.TRAINER_READ,
    Permission.TRAINER_UPDATE,

    Permission.LINKS_CREATE,
    Permission.LINKS_READ,
    Permission.LINKS_UPDATE,
  ],

  /**
   * USER — view only. No create, update, or delete on any module.
   */
  [Role.USER]: [
    Permission.COURSE_READ,
    Permission.BATCH_READ,
    Permission.TRAINER_READ,
    Permission.LINKS_READ,
  ],

};

// ─── JWT Payload ──────────────────────────────────────────────────────────────

export interface JwtAccessPayload {
  sub: string;        // user ID
  email: string;
  role: Role;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

// ─── Augment Express Request ──────────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      requestId?: string;
    }
  }
}

// ─── API Response shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ─── Authenticated request shorthand ─────────────────────────────────────────

export type AuthRequest = Request & { user: AuthenticatedUser };
