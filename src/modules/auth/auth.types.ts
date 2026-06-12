import { Role } from '../../core/types';

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponse;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── Internal context ─────────────────────────────────────────────────────────

export interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}
