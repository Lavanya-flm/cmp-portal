import { Role } from '../../core/types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UpdateMyProfileDto {
  firstName?: string;
  lastName?: string;
}

export interface ChangeRoleDto {
  role: Role;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── Response shape ───────────────────────────────────────────────────────────

/**
 * Public user profile — passwordHash and session data are never included.
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Repository result ────────────────────────────────────────────────────────

export interface FindAllUsersResult {
  data: UserResponse[];
  total: number;
}
