import { User, Token, Session, TokenType } from '@prisma/client';
import { prisma } from '../../config/database';

export class AuthRepository {
  // ─── User queries ──────────────────────────────────────────────────────────

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /** Find user by email without active/deleted filter — needed for forgot-password */
  async findUserByEmailAny(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, isActive: true, deletedAt: null },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  // ─── Registration ──────────────────────────────────────────────────────────

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        passwordHash: data.passwordHash,
        role:      'USER',
        isActive:  true,
        isEmailVerified: true, // MVP: skip email verification
      },
    });
  }

  /** Find an existing active user by email — used in duplicate-email check */
  async findActiveUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null },
    });
  }

  // ─── Refresh token CRUD ────────────────────────────────────────────────────

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<Token> {
    return prisma.token.create({
      data: { userId, type: TokenType.REFRESH, token, expiresAt },
    });
  }

  async findRefreshToken(token: string): Promise<Token | null> {
    return prisma.token.findFirst({
      where: { token, type: TokenType.REFRESH, usedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  async markTokenUsed(tokenId: string): Promise<void> {
    await prisma.token.update({ where: { id: tokenId }, data: { usedAt: new Date() } });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await prisma.token.updateMany({
      where: { userId, type: TokenType.REFRESH, usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  // ─── Password reset token CRUD ─────────────────────────────────────────────

  /** Store a password-reset token (30-minute expiry). */
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<Token> {
    // Invalidate any previous unused reset tokens for this user
    await prisma.token.updateMany({
      where: { userId, type: TokenType.PASSWORD_RESET, usedAt: null },
      data: { usedAt: new Date() },
    });
    return prisma.token.create({
      data: { userId, type: TokenType.PASSWORD_RESET, token, expiresAt },
    });
  }

  /** Find a valid, unused, non-expired password-reset token. */
  async findPasswordResetToken(token: string): Promise<Token | null> {
    return prisma.token.findFirst({
      where: {
        token,
        type: TokenType.PASSWORD_RESET,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  /** Update the user's password hash. */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  // ─── Session CRUD ──────────────────────────────────────────────────────────

  async createSession(
    userId: string,
    sessionId: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<Session> {
    return prisma.session.create({
      data: {
        userId, sessionId, expiresAt,
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
        isActive: true,
      },
    });
  }

  async findSession(sessionId: string): Promise<Session | null> {
    return prisma.session.findFirst({
      where: { sessionId, isActive: true, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { sessionId },
      data: { isActive: false, revokedAt: new Date() },
    });
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date() },
    });
  }
}

export const authRepository = new AuthRepository();
