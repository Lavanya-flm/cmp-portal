import type { Batch } from '../../../types';

type BatchStatus = 'live' | 'upcoming' | 'ended';

function getBatchStatus(batch: Batch): BatchStatus {
  const now = Date.now();
  const start = new Date(batch.startDate).getTime();
  const end = batch.endDate ? new Date(batch.endDate).getTime() : null;
  if (now < start) return 'upcoming';
  if (end && now > end) return 'ended';
  return 'live';
}

const statusStyles: Record<BatchStatus, string> = {
  live:     'bg-green-100 text-green-700 border border-green-200',
  upcoming: 'bg-blue-100 text-blue-700 border border-blue-200',
  ended:    'bg-gray-100 text-gray-500 border border-gray-200',
};

const statusDot: Record<BatchStatus, string> = {
  live:     'bg-green-500',
  upcoming: 'bg-blue-500',
  ended:    'bg-gray-400',
};

const statusLabel: Record<BatchStatus, string> = {
  live: 'Live', upcoming: 'Upcoming', ended: 'Ended',
};

interface BatchStatusBadgeProps {
  batch: Batch;
}

export function BatchStatusBadge({ batch }: BatchStatusBadgeProps) {
  const status = getBatchStatus(batch);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
      {statusLabel[status]}
    </span>
  );
}
