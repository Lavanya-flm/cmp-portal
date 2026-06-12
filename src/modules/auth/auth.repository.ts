import { User, Token, Session, TokenType } from '@prisma/client';
import { prisma } from '../../config/database';

export class AuthRepository {
  // ─── User queries ──────────────────────────────────────────────────────────

  /**
   * Find an active, non-deleted user by email.
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /**
   * Find a user by primary key — used for token refresh lookups.
   */
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, isActive: true, deletedAt: null },
    });
  }

  /**
   * Stamp lastLoginAt after a successful login.
   */
  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  // ─── Refresh token CRUD ────────────────────────────────────────────────────

  /**
   * Persist a refresh token tied to a user.
   */
  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<Token> {
    return prisma.token.create({
      data: {
        userId,
        type: TokenType.REFRESH,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Look up a refresh token record — must be unused and not expired.
   */
  async findRefreshToken(token: string): Promise<Token | null> {
    return prisma.token.findFirst({
      where: {
        token,
        type: TokenType.REFRESH,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  /**
   * Mark a refresh token as consumed (one-time use).
   */
  async markTokenUsed(tokenId: string): Promise<void> {
    await prisma.token.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }

  /**
   * Revoke all active refresh tokens for a user (used on logout).
   */
  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await prisma.token.updateMany({
      where: {
        userId,
        type: TokenType.REFRESH,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });
  }

  // ─── Session CRUD ──────────────────────────────────────────────────────────

  /**
   * Create a new session record on login.
   */
  async createSession(
    userId: string,
    sessionId: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<Session> {
    return prisma.session.create({
      data: {
        userId,
        sessionId,
        expiresAt,
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
        isActive: true,
      },
    });
  }

  /**
   * Find a session by its JWT sessionId claim.
   */
  async findSession(sessionId: string): Promise<Session | null> {
    return prisma.session.findFirst({
      where: {
        sessionId,
        isActive: true,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  /**
   * Revoke a single session (logout from current device).
   */
  async revokeSession(sessionId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { sessionId },
      data: { isActive: false, revokedAt: new Date() },
    });
  }

  /**
   * Revoke all sessions for a user (logout from all devices).
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date() },
    });
  }
}

export const authRepository = new AuthRepository();
