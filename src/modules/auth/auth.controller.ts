import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../core/utils/response.util';
import { LoginDto, RefreshTokenDto } from './auth.types';
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
   * Requires a valid access token.
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
   * Revokes all sessions across all devices.
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
   * Returns the currently authenticated user's profile from the token.
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      assertAuthenticated(req);
      sendSuccess(res, req.user, 'Authenticated user retrieved');
    } catch (error) {
      next(error);
    }
  }
}

const controller = new AuthController();
export const authController = {
  login: controller.login.bind(controller),
  refresh: controller.refresh.bind(controller),
  logout: controller.logout.bind(controller),
  logoutAll: controller.logoutAll.bind(controller),
  me: controller.me.bind(controller),
};
