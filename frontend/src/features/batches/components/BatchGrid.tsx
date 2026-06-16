import type { Batch } from '../../../types';
import { BatchCard } from './BatchCard';

interface BatchGridProps {
  batches: Batch[];
  courseId: string;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (batch: Batch) => void;
}

export function BatchGrid({ batches, courseId, canEdit, canDelete, onDelete }: BatchGridProps) {
  return (
    <div className="flex flex-col gap-3">
      {batches.map((batch) => (
        <BatchCard
          key={batch.id}
          batch={batch}
          courseId={courseId}
          canEdit={canEdit}
          canDelete={canDelete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
