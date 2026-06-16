import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../core/utils/response.util';
import { AuthRequest } from '../../core/types';

export class DashboardController {
  /**
   * GET /dashboard
   * Unified role-aware endpoint — returns all dashboard data in one request.
   */
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = (req as AuthRequest).user;
      const data = await dashboardService.getDashboard(role);
      sendSuccess(res, data, 'Dashboard data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /dashboard/admin
   * Returns aggregate counts for the admin summary panel.
   */
  async adminSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getAdminSummary();
      sendSuccess(res, data, 'Dashboard summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /dashboard/recent-courses
   * Returns the 5 most recently created courses with batch counts.
   */
  async recentCourses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getRecentCourses();
      sendSuccess(res, data, 'Recent courses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /dashboard/recent-batches
   * Returns the 5 most recently created batches with course name.
   */
  async recentBatches(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getRecentBatches();
      sendSuccess(res, data, 'Recent batches retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

const controller = new DashboardController();
export const dashboardController = {
  getDashboard:  controller.getDashboard.bind(controller),
  adminSummary:  controller.adminSummary.bind(controller),
  recentCourses: controller.recentCourses.bind(controller),
  recentBatches: controller.recentBatches.bind(controller),
};
