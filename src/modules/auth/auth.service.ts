import ms from 'ms';
import crypto from 'crypto';
import { User } from '@prisma/client';
import { authRepository } from './auth.repository';
import { userRepository } from '../user/user.repository';
import { emailService } from '../../services/email.service';
import { generateTokenPair, verifyRefreshToken } from '../../core/utils/jwt.util';
import { comparePassword, hashPassword } from '../../core/utils/password.util';
import { logger } from '../../core/logger';
import { UnauthorizedError, ConflictError } from '../../core/errors/AppError';
import { ErrorCode } from '../../core/errors/AppError';
import { Role } from '../../core/types';
import { env } from '../../config/env';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LoginResponse,
  RefreshResponse,
  AuthUserResponse,
  SessionContext,
} from './auth.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse a duration string like "7d" into a future Date.
 */
function expiryDate(duration: string): Date {
  const ms_value = ms(duration as ms.StringValue);
  return new Date(Date.now() + ms_value);
}

/**
 * Map a Prisma User record to the public AuthUserResponse shape.
 * The Prisma Role enum is cast to our core Role enum — they are
 * structurally identical string unions, just declared in different modules.
 */
function toUserResponse(user: User): AuthUserResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as unknown as Role,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AuthService {
  /**
   * Authenticate a user with email + password.
   * Creates a session and issues an access + refresh token pair.
   *
   * Deliberately uses a generic error message on failure so callers
   * cannot distinguish "email not found" from "wrong password" (prevents
   * user enumeration).
   */
  async login(dto: LoginDto, ctx: SessionContext = {}): Promise<LoginResponse> {
    const INVALID_MSG = 'Invalid email or password';

    // 1. Resolve user
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError(INVALID_MSG, ErrorCode.UNAUTHORIZED);
    }

    // 2. Verify password
    const passwordValid = await comparePassword(dto.password, user.passwordHash);
    if (!passwordValid) {
      logger.warn('Failed login attempt', { email: dto.email, ip: ctx.ipAddress });
      throw new UnauthorizedError(INVALID_MSG, ErrorCode.UNAUTHORIZED);
    }

    // 3. Generate tokens
    const { accessToken, refreshToken, sessionId } = generateTokenPair(
      user.id,
      user.email,
      user.role as unknown as Role,
    );

    const refreshExpiry = expiryDate(env.jwt.refreshExpiresIn);
    const sessionExpiry = expiryDate(env.jwt.refreshExpiresIn); // session lives as long as refresh token

    // 4. Persist refresh token + session (parallel)
    await Promise.all([
      authRepository.createRefreshToken(user.id, refreshToken, refreshExpiry),
      authRepository.createSession(
        user.id,
        sessionId,
        sessionExpiry,
        ctx.userAgent,
        ctx.ipAddress,
      ),
      authRepository.updateLastLogin(user.id),
    ]);

    logger.info('User logged in', { userId: user.id, email: user.email });

    return {
      accessToken,
      refreshToken,
      user: toUserResponse(user),
    };
  }

  /**
   * Issue a new token pair from a valid refresh token (rotation pattern).
   * The old refresh token is marked as used immediately — it cannot be reused.
   */
  async refreshTokens(dto: RefreshTokenDto): Promise<RefreshResponse> {
    // 1. Verify JWT signature + expiry
    let payload;
    try {
      payload = verifyRefreshToken(dto.refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token', ErrorCode.REFRESH_TOKEN_INVALID);
    }

    // 2. Confirm the token exists in DB and hasn't been used
    const tokenRecord = await authRepository.findRefreshToken(dto.refreshToken);
    if (!tokenRecord) {
      // Token not found OR already used — possible replay attack
      logger.warn('Refresh token reuse detected or token not found', { sub: payload.sub });
      throw new UnauthorizedError('Refresh token is invalid or has already been used', ErrorCode.REFRESH_TOKEN_INVALID);
    }

    // 3. Verify the session is still active
    const session = await authRepository.findSession(payload.sessionId);
    if (!session) {
      throw new UnauthorizedError('Session expired or revoked', ErrorCode.UNAUTHORIZED);
    }

    // 4. Resolve user
    const user = await authRepository.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User not found or deactivated', ErrorCode.UNAUTHORIZED);
    }

    // 5. Rotate — mark old token used before issuing new pair
    await authRepository.markTokenUsed(tokenRecord.id);

    // 6. Issue new pair (new sessionId)
    const { accessToken, refreshToken: newRefreshToken, sessionId: newSessionId } = generateTokenPair(
      user.id,
      user.email,
      user.role as unknown as Role,
    );

    const refreshExpiry = expiryDate(env.jwt.refreshExpiresIn);

    // 7. Revoke old session, create new one
    await Promise.all([
      authRepository.revokeSession(payload.sessionId),
      authRepository.createRefreshToken(user.id, newRefreshToken, refreshExpiry),
      authRepository.createSession(user.id, newSessionId, refreshExpiry),
    ]);

    logger.info('Tokens refreshed', { userId: user.id });

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout: revoke the current session and all refresh tokens for that session.
   */
  async logout(userId: string, sessionId: string): Promise<void> {
    await Promise.all([
      authRepository.revokeSession(sessionId),
      authRepository.revokeAllRefreshTokens(userId),
    ]);
    logger.info('User logged out', { userId, sessionId });
  }

  /**
   * Logout from all devices: wipe every session and refresh token.
   */
  async logoutAll(userId: string): Promise<void> {
    await Promise.all([
      authRepository.revokeAllSessions(userId),
      authRepository.revokeAllRefreshTokens(userId),
    ]);
    logger.info('User logged out from all devices', { userId });
  }

  // ─── Registration ──────────────────────────────────────────────────────────

  /**
   * Register a new user with role USER.
   * Does not auto-login — the user must call /auth/login after registering.
   * Returns the created user's public profile (no tokens).
   */
  async register(dto: RegisterDto): Promise<AuthUserResponse> {
    // 1. Duplicate email check
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('An account with this email address already exists');
    }

    // 2. Hash password
    const passwordHash = await hashPassword(dto.password);

    // 3. Create user with role USER
    const user = await userRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName:  dto.lastName.trim(),
      role: 'USER',
    });

    logger.info('New user registered', { userId: user.id, email: user.email });

    return {
      id:              user.id,
      email:           user.email,
      firstName:       user.firstName,
      lastName:        user.lastName,
      role:            user.role as unknown as Role,
      isActive:        user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt:     user.lastLoginAt as Date | null,
    };
  }

  // ─── Forgot password ───────────────────────────────────────────────────────

  /**
   * Generate and store a PASSWORD_RESET token.
   * In development mode the token is returned in the response so it can be
   * tested without an email provider.
   * Always returns a success message even when the email is not found —
   * this prevents user enumeration.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const PASSWORD_RESET_EXPIRES_MINS = env.email.passwordResetExpiresMins;

    // Look up user — deliberately silent if not found (prevents enumeration)
    const userRecord = await authRepository.findUserByEmail(dto.email);

    if (!userRecord) {
      logger.info('Forgot password request for unknown email', { email: dto.email });
      return; // Return void — caller always gets success response
    }

    // Revoke any existing unused PASSWORD_RESET tokens for this user
    await authRepository.revokeAllPasswordResetTokens(userRecord.id);

    // Generate a cryptographically secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt  = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MINS * 60 * 1000);

    await authRepository.createPasswordResetToken(userRecord.id, resetToken, expiresAt);

    // Build the reset link
    const resetLink = `${env.email.frontendUrl}/reset-password?token=${resetToken}`;

    logger.info('Password reset token generated', { userId: userRecord.id, expiresAt });

    // Send the email — failure is silent to the user (logged internally)
    await emailService.sendPasswordResetEmail(
      userRecord.email,
      userRecord.firstName,
      resetLink,
    );
  }

  // ─── Reset password ────────────────────────────────────────────────────────

  /**
   * Verify a PASSWORD_RESET token and update the user's password.
   * Marks the token as used and revokes all existing sessions for security.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    // 1. Validate the token
    const tokenRecord = await authRepository.findPasswordResetToken(dto.token);
    if (!tokenRecord) {
      throw new UnauthorizedError(
        'Password reset token is invalid or has expired',
        ErrorCode.UNAUTHORIZED,
      );
    }

    // 2. Hash the new password
    const passwordHash = await hashPassword(dto.newPassword);

    // 3. Update password + mark token used + revoke all sessions (parallel)
    await Promise.all([
      userRepository.updatePassword(tokenRecord.userId, passwordHash),
      authRepository.markTokenUsed(tokenRecord.id),
      authRepository.revokeAllPasswordResetTokens(tokenRecord.userId),
      authRepository.revokeAllSessions(tokenRecord.userId),
      authRepository.revokeAllRefreshTokens(tokenRecord.userId),
    ]);

    logger.info('Password reset successful', { userId: tokenRecord.userId });
  }
}

export const authService = new AuthService();
