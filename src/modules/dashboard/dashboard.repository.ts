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
    const now = new Date();

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
      // Live: startDate <= now AND (endDate is null OR endDate >= now)
      prisma.batch.count({
        where: {
          startDate: { lte: now },
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      }),
      // Upcoming: startDate > now
      prisma.batch.count({ where: { startDate: { gt: now } } }),
      // Completed: endDate < now (endDate is not null)
      prisma.batch.count({ where: { endDate: { lt: now } } }),
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
        id:             true,
        batchName:      true,
        batchMonthYear: true,
        startDate:      true,
        endDate:        true,
        course:         { select: { name: true } },
      },
    });

    const now = new Date();
    return batches.map((b) => {
      let status: string;
      if (now < b.startDate) status = 'Upcoming';
      else if (b.endDate && now > b.endDate) status = 'Completed';
      else status = 'Live';

      return {
        id:             b.id,
        batchName:      b.batchName,
        batchMonthYear: b.batchMonthYear,
        status,
        courseName:     b.course.name,
      };
    });
  }
}

export const dashboardRepository = new DashboardRepository();
