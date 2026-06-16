import { dashboardRepository } from './dashboard.repository';
import {
  AdminSummaryResponse,
  RecentCourseItem,
  RecentBatchItem,
  DashboardResponse,
} from './dashboard.types';
import { Role } from '../../core/types';

export class DashboardService {
  async getAdminSummary(): Promise<AdminSummaryResponse> {
    return dashboardRepository.getAdminSummary();
  }

  async getRecentCourses(): Promise<RecentCourseItem[]> {
    return dashboardRepository.getRecentCourses();
  }

  async getRecentBatches(): Promise<RecentBatchItem[]> {
    return dashboardRepository.getRecentBatches();
  }

  /**
   * Unified dashboard — fetches all data in parallel and returns a single
   * role-aware payload.  USER role receives summary: null.
   */
  async getDashboard(userRole: string): Promise<DashboardResponse> {
    const isAdmin =
      userRole === Role.SUPER_ADMIN || userRole === Role.SUB_ADMIN;

    // Run all three queries concurrently; skip summary for non-admins
    const [summary, recentCourses, recentBatches] = await Promise.all([
      isAdmin ? dashboardRepository.getAdminSummary() : Promise.resolve(null),
      dashboardRepository.getRecentCourses(),
      dashboardRepository.getRecentBatches(),
    ]);

    return {
      role: userRole,
      summary,
      recentCourses,
      recentBatches,
    };
  }
}

export const dashboardService = new DashboardService();
