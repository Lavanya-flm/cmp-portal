import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useCreateUser } from '../hooks/useUsers';
import { useToast } from '../hooks/useToast';
import { UserForm } from '../features/users/components/UserForm';
import { ToastContainer } from '../components/ui/Toast';
import { ROUTES } from '../utils/constants';
import type { CreateUserFormValues } from '../features/users/user.schema';

export function CreateUserPage() {
  const navigate = useNavigate();
  const { mutate: createUser, isPending, error, reset } = useCreateUser();
  const { toasts, addToast, removeToast } = useToast();

  const handleSubmit = (data: CreateUserFormValues) => {
    reset();
    createUser(
      { firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password, role: data.role },
      {
        onSuccess: (created) => {
          addToast(`${created.firstName} ${created.lastName} created successfully.`, 'success');
          setTimeout(() => navigate(ROUTES.USERS), 700);
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1200px] w-full px-6 py-6 lg:py-8">
        <button type="button" onClick={() => navigate(ROUTES.USERS)}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors">
          <ChevronLeft size={16} /> Back to Users
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new user to the CMP Portal.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <UserForm
            mode="create"
            isSubmitting={isPending}
            submitError={error}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTES.USERS)}
          />
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
