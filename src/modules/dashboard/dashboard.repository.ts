import { prisma } from '../../config/database';
import {
  AdminSummaryResponse,
  RecentCourseItem,
  RecentBatchItem,
} from './dashboard.types';

export class DashboardRepository {
  /**
   * Aggregate counts for the admin summary card.
   * Uses a single $transaction to run all queries in one round-trip.
   */
  async getAdminSummary(): Promise<AdminSummaryResponse> {
    const [
      totalCourses,
      totalBatches,
      liveBatches,
      upcomingBatches,
      completedBatches,
      totalUsers,
    ] = await prisma.$transaction([
      prisma.course.count(),
      prisma.batch.count(),
      prisma.batch.count({ where: { status: 'Live' } }),
      prisma.batch.count({ where: { status: 'Upcoming' } }),
      prisma.batch.count({ where: { status: 'Completed' } }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return {
      totalCourses,
      totalBatches,
      liveBatches,
      upcomingBatches,
      completedBatches,
      totalUsers,
    };
  }

  /**
   * Return the 5 most recently created courses with their batch counts.
   */
  async getRecentCourses(): Promise<RecentCourseItem[]> {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id:        true,
        name:      true,
        createdAt: true,
        _count:    { select: { batches: true } },
      },
    });

    return courses.map((c) => ({
      id:           c.id,
      name:         c.name,
      totalBatches: c._count.batches,
      createdAt:    c.createdAt,
    }));
  }

  /**
   * Return the 5 most recently created batches with their course name.
   */
  async getRecentBatches(): Promise<RecentBatchItem[]> {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id:            true,
        batchName:     true,
        batchMonthYear: true,
        status:        true,
        course:        { select: { name: true } },
      },
    });

    return batches.map((b) => ({
      id:             b.id,
      batchName:      b.batchName,
      batchMonthYear: b.batchMonthYear,
      status:         b.status,
      courseName:     b.course.name,
    }));
  }
}

export const dashboardRepository = new DashboardRepository();
