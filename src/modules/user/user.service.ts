import { User } from '@prisma/client';
import { userRepository } from './user.repository';
import { hashPassword, comparePassword } from '../../core/utils/password.util';
import { buildPaginationMeta } from '../../core/utils/response.util';
import { logger } from '../../core/logger';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
  UnauthorizedError,
} from '../../core/errors/AppError';
import { Role } from '../../core/types';
import { PaginationMeta } from '../../core/types';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateMyProfileDto,
  ChangeRoleDto,
  ChangePasswordDto,
  UserQueryDto,
  UserResponse,
} from './user.types';

// ─── Protected system account ─────────────────────────────────────────────────

/** The seed SUPER_ADMIN that can never be deleted */
const SEED_SUPER_ADMIN_EMAIL = 'superadmin@cmp.io';

// ─── Response mapper ──────────────────────────────────────────────────────────

function toResponse(user: Omit<User, 'passwordHash' | 'deletedAt'>): UserResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as unknown as Role,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class UserService {
  // ─── Admin operations ───────────────────────────────────────────────────────

  /**
   * Create a new user.
   * SUPER_ADMIN only.
   * Fails if the email already exists.
   */
  async createUser(dto: CreateUserDto): Promise<UserResponse> {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError(`Email "${dto.email}" is already in use`);
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await userRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
    });

    logger.info('User created', { userId: user.id, email: user.email, role: dto.role });

    return toResponse(user);
  }

  /**
   * List all users with pagination and optional search.
   * SUPER_ADMIN + SUB_ADMIN.
   */
  async getUsers(
    query: UserQueryDto,
  ): Promise<{ users: UserResponse[]; meta: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { data, total } = await userRepository.findAll({ ...query, page, limit });

    return {
      users: data.map(toResponse),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get a single user by ID.
   * - SUPER_ADMIN + SUB_ADMIN: any user
   * - USER: own profile only (enforced at route level via requireOwnerOrRole)
   */
  async getUserById(id: string): Promise<UserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return toResponse(user);
  }

  /**
   * Update a user's firstName, lastName, or isActive status.
   * SUPER_ADMIN only.
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('User');
    }

    const updated = await userRepository.update(id, {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    logger.info('User updated by admin', { targetUserId: id });

    return toResponse(updated);
  }

  /**
   * Delete a user permanently.
   * SUPER_ADMIN only.
   *
   * Guards:
   *  - Cannot delete yourself
   *  - Cannot delete the seed SUPER_ADMIN
   *  - Cannot delete the last remaining SUPER_ADMIN
   */
  async deleteUser(targetId: string, requesterId: string): Promise<void> {
    const user = await userRepository.findById(targetId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Guard: self-delete
    if (targetId === requesterId) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    // Guard: system seed account
    if (user.email === SEED_SUPER_ADMIN_EMAIL) {
      throw new ForbiddenError('The system seed SUPER_ADMIN account cannot be deleted');
    }

    // Guard: last SUPER_ADMIN
    if ((user.role as unknown as Role) === Role.SUPER_ADMIN) {
      const superAdminCount = await userRepository.countSuperAdmins();
      if (superAdminCount <= 1) {
        throw new ForbiddenError('Cannot delete the last SUPER_ADMIN account');
      }
    }

    await userRepository.delete(targetId);

    logger.info('User deleted', { targetUserId: targetId, deletedBy: requesterId });
  }

  /**
   * Change a user's role.
   * SUPER_ADMIN only.
   *
   * Guards:
   *  - Cannot remove the last SUPER_ADMIN by demoting them
   */
  async changeRole(targetId: string, dto: ChangeRoleDto): Promise<UserResponse> {
    const user = await userRepository.findById(targetId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Guard: demoting the last SUPER_ADMIN
    if (
      (user.role as unknown as Role) === Role.SUPER_ADMIN &&
      dto.role !== Role.SUPER_ADMIN
    ) {
      const superAdminCount = await userRepository.countSuperAdmins();
      if (superAdminCount <= 1) {
        throw new ForbiddenError('Cannot change the role of the last SUPER_ADMIN');
      }
    }

    const updated = await userRepository.updateRole(targetId, dto.role);

    logger.info('User role changed', {
      targetUserId: targetId,
      oldRole: user.role,
      newRole: dto.role,
    });

    return toResponse(updated);
  }

  // ─── Self-service operations ────────────────────────────────────────────────

  /**
   * Get the current user's own profile.
   */
  async getMyProfile(userId: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return toResponse(user);
  }

  /**
   * Update the current user's own firstName/lastName.
   */
  async updateMyProfile(userId: string, dto: UpdateMyProfileDto): Promise<UserResponse> {
    const existing = await userRepository.findById(userId);
    if (!existing) {
      throw new NotFoundError('User');
    }

    const updated = await userRepository.update(userId, {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
    });

    logger.info('User updated own profile', { userId });

    return toResponse(updated);
  }

  /**
   * Change the current user's password.
   * Verifies current password, hashes new password, then revokes
   * all active sessions and refresh tokens so re-login is required.
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isValid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Prevent reuse of the same password
    const isSame = await comparePassword(dto.newPassword, user.passwordHash);
    if (isSame) {
      throw new BadRequestError('New password must be different from the current password');
    }

    const newHash = await hashPassword(dto.newPassword);

    // Update password and revoke all sessions in parallel
    await Promise.all([
      userRepository.updatePassword(userId, newHash),
      userRepository.revokeAllSessions(userId),
      userRepository.revokeAllRefreshTokens(userId),
    ]);

    logger.info('User changed password — all sessions revoked', { userId });
  }
}

export const userService = new UserService();
