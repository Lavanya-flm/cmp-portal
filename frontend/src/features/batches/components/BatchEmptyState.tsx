import { GraduationCap, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface BatchEmptyStateProps {
  canCreate: boolean;
  onCreateClick?: () => void;
}

export function BatchEmptyState({ canCreate, onCreateClick }: BatchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
        <GraduationCap size={26} className="text-amber-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">No batches yet</p>
        <p className="mt-1 max-w-xs text-xs text-gray-500">
          {canCreate
            ? 'Create the first batch for this course.'
            : 'Batches will appear here once added.'}
        </p>
      </div>
      {canCreate && onCreateClick && (
        <Button variant="primary" size="sm" onClick={onCreateClick}>
          <Plus size={14} />
          Create Batch
        </Button>
      )}
    </div>
  );
}
