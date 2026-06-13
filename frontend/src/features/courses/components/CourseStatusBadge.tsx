import type { Course, Batch } from '../../../types';

export type CourseStatus = 'draft' | 'upcoming' | 'live' | 'completed' | 'archived';

// ─── Derive status from course + batch data ───────────────────────────────────

export function deriveCourseStatus(course: Course, batches: Batch[]): CourseStatus {
  if (!batches.length) {
    // No batches — treat as upcoming if created recently (< 7 days), else draft
    const age = Date.now() - new Date(course.createdAt).getTime();
    return age < 7 * 24 * 60 * 60 * 1000 ? 'upcoming' : 'draft';
  }

  const now = Date.now();
  const hasLive = batches.some((b) => {
    const start = new Date(b.startDate).getTime();
    const end = b.endDate ? new Date(b.endDate).getTime() : Infinity;
    return now >= start && now <= end;
  });
  if (hasLive) return 'live';

  const hasUpcoming = batches.some((b) => new Date(b.startDate).getTime() > now);
  if (hasUpcoming) return 'upcoming';

  return 'completed';
}

// ─── Badge styles ─────────────────────────────────────────────────────────────

const config: Record<CourseStatus, { label: string; classes: string }> = {
  draft:     { label: 'Draft',     classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  upcoming:  { label: 'Upcoming',  classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  live:      { label: 'Live',      classes: 'bg-green-100 text-green-700 border-green-200' },
  completed: { label: 'Completed', classes: 'bg-purple-100 text-purple-700 border-purple-200' },
  archived:  { label: 'Archived',  classes: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const dotColor: Record<CourseStatus, string> = {
  draft:     'bg-gray-400',
  upcoming:  'bg-blue-500',
  live:      'bg-green-500',
  completed: 'bg-purple-500',
  archived:  'bg-slate-400',
};

interface CourseStatusBadgeProps {
  status: CourseStatus;
}

export function CourseStatusBadge({ status }: CourseStatusBadgeProps) {
  const { label, classes } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[status]}`} />
      {label}
    </span>
  );
}
