import type { Batch } from '../../../types';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

interface DeleteBatchDialogProps {
  batch: Batch | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteBatchDialog({ batch, loading, onConfirm, onCancel }: DeleteBatchDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(batch)}
      title="Delete Batch"
      description={
        <span>
          Are you sure you want to delete{' '}
          <strong className="text-gray-900">{batch?.batchName}</strong>? This will
          also permanently remove the trainer and all resource links for this batch.
          This action cannot be undone.
        </span>
      }
      confirmLabel="Delete Batch"
      cancelLabel="Cancel"
      variant="danger"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
