import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useUser, useUpdateUser } from '../hooks/useUsers';
import { useToast } from '../hooks/useToast';
import { UserForm } from '../features/users/components/UserForm';
import { ToastContainer } from '../components/ui/Toast';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/format';
import type { EditUserFormValues } from '../features/users/user.schema';

export function EditUserPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const { data: user, isLoading, isError, error: fetchError } = useUser(id);
  const { mutate: updateUser, isPending, error: updateError, reset } = useUpdateUser(id);

  const handleSubmit = (data: EditUserFormValues) => {
    reset();
    updateUser(
      { firstName: data.firstName, lastName: data.lastName, isActive: data.isActive },
      {
        onSuccess: () => {
          addToast('User updated successfully.', 'success');
          setTimeout(() => navigate(ROUTES.USERS), 700);
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1200px] w-full px-6 py-6 lg:py-8">
        <button
          type="button"
          onClick={() => navigate(ROUTES.USERS)}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Users
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          {user && (
            <p className="mt-1 text-sm text-gray-500">
              Editing: <span className="font-medium text-gray-700">{user.firstName} {user.lastName}</span>
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-11 rounded-lg bg-gray-100" />)}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            Failed to load user: {getErrorMessage(fetchError)}
          </div>
        )}

        {/* Form */}
        {!isLoading && !isError && user && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <UserForm
              mode="edit"
              defaultValues={user}
              isSubmitting={isPending}
              submitError={updateError}
              onSubmit={handleSubmit}
              onCancel={() => navigate(ROUTES.USERS)}
            />
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
