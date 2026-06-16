import type { Course, Batch } from '../../../types';

// ─── 3 allowed statuses only ──────────────────────────────────────────────────
export type CourseStatus = 'upcoming' | 'live' | 'completed';

// ─── Derive status from batch data ───────────────────────────────────────────

export function deriveCourseStatus(_course: Course, batches: Batch[]): CourseStatus {
  if (!batches.length) return 'upcoming';

  const now = Date.now();

  const hasLive = batches.some((b) => {
    const start = new Date(b.startDate).getTime();
    const end   = b.endDate ? new Date(b.endDate).getTime() : Infinity;
    return now >= start && now <= end;
  });
  if (hasLive) return 'live';

  const hasUpcoming = batches.some((b) => new Date(b.startDate).getTime() > now);
  if (hasUpcoming) return 'upcoming';

  return 'completed';
}

// ─── Badge config ─────────────────────────────────────────────────────────────

const config: Record<CourseStatus, { label: string; classes: string; dot: string }> = {
  upcoming:  { label: 'Upcoming',  classes: 'bg-blue-50 text-blue-700 border-blue-200',   dot: 'bg-blue-500' },
  live:      { label: 'Live',      classes: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  completed: { label: 'Completed', classes: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
};

interface CourseStatusBadgeProps {
  status: CourseStatus;
}

export function CourseStatusBadge({ status }: CourseStatusBadgeProps) {
  const { label, classes, dot } = config[status] ?? config.upcoming;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
