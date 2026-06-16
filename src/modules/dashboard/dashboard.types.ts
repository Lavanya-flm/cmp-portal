// ─── Admin summary ────────────────────────────────────────────────────────────

export interface AdminSummaryResponse {
  totalCourses: number;
  totalBatches: number;
  liveBatches: number;
  upcomingBatches: number;
  completedBatches: number;
  totalUsers: number;
}

// ─── Recent courses ───────────────────────────────────────────────────────────

export interface RecentCourseItem {
  id: string;
  name: string;
  totalBatches: number;
  createdAt: Date;
}

// ─── Recent batches ───────────────────────────────────────────────────────────

export interface RecentBatchItem {
  id: string;
  batchName: string;
  batchMonthYear: string | null;
  status: string;
  courseName: string;
}

// ─── Unified dashboard response ───────────────────────────────────────────────

export interface DashboardResponse {
  /** The role of the authenticated user making the request */
  role: string;
  /** Aggregate statistics — null when user lacks admin access */
  summary: AdminSummaryResponse | null;
  /** 5 most recent courses */
  recentCourses: RecentCourseItem[];
  /** 5 most recent batches */
  recentBatches: RecentBatchItem[];
}
