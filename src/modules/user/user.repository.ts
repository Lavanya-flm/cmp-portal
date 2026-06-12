import { User, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { UserQueryDto } from './user.types';

export class UserRepository {
  // ─── Select clause — never expose sensitive fields ────────────────────────

  private readonly safeSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    isActive: true,
    isEmailVerified: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
    // explicitly excluded: passwordHash, deletedAt, tokens, sessions
  } as const;

  // ─── Read ──────────────────────────────────────────────────────────────────

  /**
   * Find all non-deleted users with optional full-text search across
   * email, firstName, and lastName.
   */
  async findAll(query: UserQueryDto): Promise<{ data: Omit<User, 'passwordHash' | 'deletedAt'>[]; total: number }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: this.safeSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { data: data as Omit<User, 'passwordHash' | 'deletedAt'>[], total };
  }

  /**
   * Find a single non-deleted user by UUID — returns safe fields only.
   */
  async findById(id: string): Promise<Omit<User, 'passwordHash' | 'deletedAt'> | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: this.safeSelect,
    }) as Promise<Omit<User, 'passwordHash' | 'deletedAt'> | null>;
  }

  /**
   * Find a user including the passwordHash — needed for password verification.
   * This is the only method that returns the full User object.
   */
  async findByIdWithPassword(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Find a non-deleted user by email (case-insensitive) — used for
   * duplicate email checks.
   */
  async findByEmail(email: string, excludeId?: string): Promise<{ id: string } | null> {
    return prisma.user.findFirst({
      where: {
        email: { equals: email, mode: Prisma.QueryMode.insensitive },
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
  }

  /**
   * Count how many non-deleted SUPER_ADMIN users exist.
   * Used to protect against removing the last super admin.
   */
  async countSuperAdmins(): Promise<number> {
    return prisma.user.count({
      where: { role: 'SUPER_ADMIN', deletedAt: null },
    });
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  /**
   * Create a new user. Returns safe fields (no passwordHash).
   */
  async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: string;
  }): Promise<Omit<User, 'passwordHash' | 'deletedAt'>> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as User['role'],
      },
      select: this.safeSelect,
    }) as Promise<Omit<User, 'passwordHash' | 'deletedAt'>>;
  }

  /**
   * Update user profile fields. Returns safe fields.
   */
  async update(
    id: string,
    data: { firstName?: string; lastName?: string; isActive?: boolean },
  ): Promise<Omit<User, 'passwordHash' | 'deletedAt'>> {
    return prisma.user.update({
      where: { id },
      data,
      select: this.safeSelect,
    }) as Promise<Omit<User, 'passwordHash' | 'deletedAt'>>;
  }

  /**
   * Update a user's role. Returns safe fields.
   */
  async updateRole(
    id: string,
    role: string,
  ): Promise<Omit<User, 'passwordHash' | 'deletedAt'>> {
    return prisma.user.update({
      where: { id },
      data: { role: role as User['role'] },
      select: this.safeSelect,
    }) as Promise<Omit<User, 'passwordHash' | 'deletedAt'>>;
  }

  /**
   * Update a user's password hash.
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /**
   * Hard-delete a user by UUID.
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  // ─── Session / token cleanup (reused from auth) ────────────────────────────

  /**
   * Revoke all active sessions for a user (used after password change).
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date() },
    });
  }

  /**
   * Mark all refresh tokens as used (used after password change).
   */
  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await prisma.token.updateMany({
      where: { userId, type: 'REFRESH', usedAt: null },
      data: { usedAt: new Date() },
    });
  }
}

export const userRepository = new UserRepository();
