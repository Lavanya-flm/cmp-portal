import ms from 'ms';
import { randomBytes } from 'crypto';
import { User } from '@prisma/client';
import { authRepository } from './auth.repository';
import { generateTokenPair, verifyRefreshToken } from '../../core/utils/jwt.util';
import { comparePassword, hashPassword } from '../../core/utils/password.util';
import { logger } from '../../core/logger';
import { UnauthorizedError, ConflictError, BadRequestError } from '../../core/errors/AppError';
import { ErrorCode } from '../../core/errors/AppError';
import { Role } from '../../core/types';
import { env } from '../../config/env';
import { emailService } from '../../services/email.service';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LoginResponse,
  RefreshResponse,
  RegisterResponse,
  ForgotPasswordResponse,
  AuthUserResponse,
  SessionContext,
} from './auth.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function expiryDate(duration: string): Date {
  const ms_value = ms(duration as ms.StringValue);
  return new Date(Date.now() + ms_value);
}

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

  // ── Register ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    // Duplicate email check (case-insensitive)
    const existing = await authRepository.findActiveUserByEmail(dto.email);
    if (existing) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await authRepository.createUser({
      firstName: dto.firstName,
      lastName:  dto.lastName,
      email:     dto.email,
      passwordHash,
    });

    logger.info('User registered', { userId: user.id, email: user.email });

    return { user: toUserResponse(user) };
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, ctx: SessionContext = {}): Promise<LoginResponse> {
    const INVALID_MSG = 'Invalid email or password';

    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) throw new UnauthorizedError(INVALID_MSG, ErrorCode.UNAUTHORIZED);

    const passwordValid = await comparePassword(dto.password, user.passwordHash);
    if (!passwordValid) {
      logger.warn('Failed login attempt', { email: dto.email, ip: ctx.ipAddress });
      throw new UnauthorizedError(INVALID_MSG, ErrorCode.UNAUTHORIZED);
    }

    const { accessToken, refreshToken, sessionId } = generateTokenPair(
      user.id, user.email, user.role as unknown as Role,
    );

    const refreshExpiry  = expiryDate(env.jwt.refreshExpiresIn);
    const sessionExpiry  = expiryDate(env.jwt.refreshExpiresIn);

    await Promise.all([
      authRepository.createRefreshToken(user.id, refreshToken, refreshExpiry),
      authRepository.createSession(user.id, sessionId, sessionExpiry, ctx.userAgent, ctx.ipAddress),
      authRepository.updateLastLogin(user.id),
    ]);

    logger.info('User logged in', { userId: user.id, email: user.email });
    return { accessToken, refreshToken, user: toUserResponse(user) };
  }

  // ── Forgot password ──────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    const GENERIC_MSG = 'If an account with that email exists, a password reset link has been sent. Please check your inbox.';

    // Always return the same message to prevent user enumeration
    const user = await authRepository.findUserByEmailAny(dto.email);
    if (!user) {
      logger.info('Forgot password — email not found (generic response)', { email: dto.email });
      return { message: GENERIC_MSG };
    }

    // Generate a secure random token (32 bytes hex = 64 chars)
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt  = new Date(
      Date.now() + env.email.passwordResetExpiresMins * 60 * 1000,
    );

    await authRepository.createPasswordResetToken(user.id, resetToken, expiresAt);

    logger.info('Password reset token generated', { userId: user.id });

    // Send password reset email — throws on failure so the controller
    // can return an appropriate error to the user
    await emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

    return { message: GENERIC_MSG };
  }

  // ── Reset password ────────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenRecord = await authRepository.findPasswordResetToken(dto.token);
    if (!tokenRecord) {
      throw new BadRequestError('Password reset token is invalid or has expired');
    }

    // Hash new password
    const passwordHash = await hashPassword(dto.newPassword);

    // Apply all changes atomically: update password + invalidate token + revoke sessions
    await Promise.all([
      authRepository.updatePassword(tokenRecord.userId, passwordHash),
      authRepository.markTokenUsed(tokenRecord.id),
      authRepository.revokeAllSessions(tokenRecord.userId),
      authRepository.revokeAllRefreshTokens(tokenRecord.userId),
    ]);

    logger.info('Password reset successfully', { userId: tokenRecord.userId });
  }

  // ── Refresh tokens ────────────────────────────────────────────────────────────

  async refreshTokens(dto: RefreshTokenDto): Promise<RefreshResponse> {
    let payload;
    try {
      payload = verifyRefreshToken(dto.refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token', ErrorCode.REFRESH_TOKEN_INVALID);
    }

    const tokenRecord = await authRepository.findRefreshToken(dto.refreshToken);
    if (!tokenRecord) {
      logger.warn('Refresh token reuse detected or not found', { sub: payload.sub });
      throw new UnauthorizedError('Refresh token is invalid or has already been used', ErrorCode.REFRESH_TOKEN_INVALID);
    }

    const session = await authRepository.findSession(payload.sessionId);
    if (!session) throw new UnauthorizedError('Session expired or revoked', ErrorCode.UNAUTHORIZED);

    const user = await authRepository.findUserById(payload.sub);
    if (!user) throw new UnauthorizedError('User not found or deactivated', ErrorCode.UNAUTHORIZED);

    await authRepository.markTokenUsed(tokenRecord.id);

    const { accessToken, refreshToken: newRefreshToken, sessionId: newSessionId } = generateTokenPair(
      user.id, user.email, user.role as unknown as Role,
    );
    const refreshExpiry = expiryDate(env.jwt.refreshExpiresIn);

    await Promise.all([
      authRepository.revokeSession(payload.sessionId),
      authRepository.createRefreshToken(user.id, newRefreshToken, refreshExpiry),
      authRepository.createSession(user.id, newSessionId, refreshExpiry),
    ]);

    logger.info('Tokens refreshed', { userId: user.id });
    return { accessToken, refreshToken: newRefreshToken };
  }

  // ── Logout ────────────────────────────────────────────────────────────────────

  async logout(userId: string, sessionId: string): Promise<void> {
    await Promise.all([
      authRepository.revokeSession(sessionId),
      authRepository.revokeAllRefreshTokens(userId),
    ]);
    logger.info('User logged out', { userId, sessionId });
  }

  async logoutAll(userId: string): Promise<void> {
    await Promise.all([
      authRepository.revokeAllSessions(userId),
      authRepository.revokeAllRefreshTokens(userId),
    ]);
    logger.info('User logged out from all devices', { userId });
  }
}

export const authService = new AuthService();
