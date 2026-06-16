// Status is now stored on the batch record — no date derivation needed.

export type BatchStatus = 'Upcoming' | 'Live' | 'Completed';

const statusStyles: Record<BatchStatus, string> = {
  Upcoming:  'bg-amber-50 text-amber-700 border border-amber-200',
  Live:      'bg-green-50 text-green-700 border border-green-200',
  Completed: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const statusDot: Record<BatchStatus, string> = {
  Upcoming:  'bg-amber-500',
  Live:      'bg-green-500',
  Completed: 'bg-gray-400',
};

interface BatchStatusBadgeProps {
  /** The stored batch status string — "Upcoming" | "Live" | "Completed" */
  status: string;
}

export function BatchStatusBadge({ status }: BatchStatusBadgeProps) {
  const key = (status ?? 'Upcoming') as BatchStatus;
  const styles = statusStyles[key] ?? statusStyles.Upcoming;
  const dot    = statusDot[key]    ?? statusDot.Upcoming;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {key}
    </span>
  );
}
