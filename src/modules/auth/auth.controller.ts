import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../core/utils/response.util';
import { LoginDto, RefreshTokenDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './auth.types';
import { assertAuthenticated } from '../../core/middleware/auth.middleware';

export class AuthController {
  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as LoginDto;
      const ctx = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip ?? req.socket.remoteAddress,
      };
      const result = await authService.login(dto, ctx);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as RefreshTokenDto;
      const result = await authService.refreshTokens(dto);
      sendSuccess(res, result, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      assertAuthenticated(req);
      await authService.logout(req.user.id, req.user.sessionId);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout-all
   */
  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      assertAuthenticated(req);
      await authService.logoutAll(req.user.id);
      sendSuccess(res, null, 'Logged out from all devices');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      assertAuthenticated(req);
      sendSuccess(res, req.user, 'Authenticated user retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/register
   * Creates a new USER-role account. Does not auto-login.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as RegisterDto;
      const user = await authService.register(dto);
      sendSuccess(res, user, 'Account created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/forgot-password
   * Always responds with success to prevent email enumeration.
   * In development mode the reset token is included in the response.
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as ForgotPasswordDto;
      await authService.forgotPassword(dto);
      sendSuccess(
        res,
        null,
        'If an account exists with this email, a password reset link has been sent.',
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as ResetPasswordDto;
      await authService.resetPassword(dto);
      sendSuccess(res, null, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }
}

const controller = new AuthController();
export const authController = {
  login:         controller.login.bind(controller),
  refresh:       controller.refresh.bind(controller),
  logout:        controller.logout.bind(controller),
  logoutAll:     controller.logoutAll.bind(controller),
  me:            controller.me.bind(controller),
  register:      controller.register.bind(controller),
  forgotPassword: controller.forgotPassword.bind(controller),
  resetPassword:  controller.resetPassword.bind(controller),
};
