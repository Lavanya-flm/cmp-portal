import { BookOpen, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  filtered?: boolean;
}

export function EmptyState({
  title = 'No courses yet',
  description = 'Get started by creating your first course.',
  actionLabel = 'Create Course',
  onAction,
  filtered = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
        <BookOpen size={28} className="text-amber-500" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
      </div>
      {!filtered && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          <Plus size={16} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
