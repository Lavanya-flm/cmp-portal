import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { changeRoleSchema, ChangeRoleFormValues } from '../user.schema';
import type { User, Role } from '../../../types';

const ROLES: { value: Role; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'SUB_ADMIN',   label: 'Sub Admin'   },
  { value: 'USER',        label: 'User'         },
];

interface ChangeRoleDialogProps {
  user: User | null;
  loading: boolean;
  onConfirm: (role: Role) => void;
  onCancel: () => void;
}

export function ChangeRoleDialog({ user, loading, onConfirm, onCancel }: ChangeRoleDialogProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ChangeRoleFormValues>({
    resolver: zodResolver(changeRoleSchema),
    defaultValues: { role: user?.role ?? 'USER' },
  });

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl shadow-black/10">
        {/* Icon */}
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <h3 className="mb-1 text-base font-semibold text-gray-900">Change Role</h3>
        <p className="mb-5 text-sm text-gray-500">
          Update the role for <span className="font-medium text-gray-700">{user.firstName} {user.lastName}</span>.
        </p>

        <form onSubmit={handleSubmit((d) => onConfirm(d.role))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">New Role</label>
            <div className="relative">
              <select
                {...register('role')}
                className="h-10 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-3.5 pr-8 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={loading}>
              Update Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
