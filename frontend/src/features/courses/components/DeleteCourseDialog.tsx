import type { Course } from '../../../types';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

interface DeleteCourseDialogProps {
  course: Course | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteCourseDialog({
  course,
  loading,
  onConfirm,
  onCancel,
}: DeleteCourseDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(course)}
      title="Delete Course"
      description={
        <span>
          Are you sure you want to delete{' '}
          <strong className="text-gray-900">{course?.name}</strong>? This will
          also permanently delete all associated batches, trainers, and resource
          links. This action cannot be undone.
        </span>
      }
      confirmLabel="Delete Course"
      cancelLabel="Cancel"
      variant="danger"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
