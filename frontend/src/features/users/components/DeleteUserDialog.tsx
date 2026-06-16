import type { User } from '../../../types';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

interface DeleteUserDialogProps {
  user: User | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteUserDialog({ user, loading, onConfirm, onCancel }: DeleteUserDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(user)}
      title="Delete User"
      description={
        <span>
          Are you sure you want to permanently delete{' '}
          <strong className="text-gray-900">
            {user?.firstName} {user?.lastName}
          </strong>{' '}
          ({user?.email})? This action cannot be undone.
        </span>
      }
      confirmLabel="Delete User"
      cancelLabel="Cancel"
      variant="danger"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
