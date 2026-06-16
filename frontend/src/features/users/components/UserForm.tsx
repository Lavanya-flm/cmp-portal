import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ErrorBanner } from '../../../components/auth/ErrorBanner';
import { createUserSchema, editUserSchema, CreateUserFormValues, EditUserFormValues } from '../user.schema';
import { getErrorMessage } from '../../../utils/format';
import type { User, Role } from '../../../types';

// ─── Create form ──────────────────────────────────────────────────────────────

const ROLES: { value: Role; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'SUB_ADMIN',   label: 'Sub Admin'   },
  { value: 'USER',        label: 'User'         },
];

interface CreateUserFormProps {
  mode: 'create';
  isSubmitting: boolean;
  submitError: unknown;
  onSubmit: (data: CreateUserFormValues) => void;
  onCancel: () => void;
}

interface EditUserFormProps {
  mode: 'edit';
  defaultValues: User;
  isSubmitting: boolean;
  submitError: unknown;
  onSubmit: (data: EditUserFormValues) => void;
  onCancel: () => void;
}

type UserFormProps = CreateUserFormProps | EditUserFormProps;

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

// ─── Create variant ───────────────────────────────────────────────────────────

function CreateForm({ isSubmitting, submitError, onSubmit, onCancel }: CreateUserFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
  });

  const serverError = submitError ? getErrorMessage(submitError) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {serverError && <ErrorBanner message={serverError} />}

      <Row>
        <Input label="First Name" placeholder="First Name" error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last Name"  placeholder="Last Name"  error={errors.lastName?.message}  {...register('lastName')} />
      </Row>

      <Input label="Email Address" type="email" placeholder="Email Address" error={errors.email?.message} {...register('email')} />

      <Input
        label="Password"
        type="password"
        placeholder="Password (min 8 chars)"
        error={errors.password?.message}
        hint="Min 8 characters, include uppercase, number, and special character."
        {...register('password')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Role</label>
        <div className="relative">
          <select
            {...register('role')}
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-3.5 pr-8 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-gray-400 transition-colors"
          >
            <option value="">Select a role</option>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" variant="primary" size="md" loading={isSubmitting}>Create User</Button>
      </div>
    </form>
  );
}

// ─── Edit variant ─────────────────────────────────────────────────────────────

function EditForm({ defaultValues, isSubmitting, submitError, onSubmit, onCancel }: EditUserFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: defaultValues.firstName,
      lastName:  defaultValues.lastName,
      isActive:  defaultValues.isActive,
    },
  });

  useEffect(() => {
    reset({ firstName: defaultValues.firstName, lastName: defaultValues.lastName, isActive: defaultValues.isActive });
  }, [defaultValues, reset]);

  const serverError = submitError ? getErrorMessage(submitError) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {serverError && <ErrorBanner message={serverError} />}

      <Row>
        <Input label="First Name" placeholder="First Name" error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last Name"  placeholder="Last Name"  error={errors.lastName?.message}  {...register('lastName')} />
      </Row>

      {/* Email — read-only */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          value={defaultValues.email}
          disabled
          className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400">Email address cannot be changed.</p>
      </div>

      {/* Active status toggle */}
      <label className="flex cursor-pointer items-center gap-3 select-none">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 accent-amber-500 focus:ring-amber-400"
          {...register('isActive')}
        />
        <span className="text-sm font-medium text-gray-700">Account is active</span>
      </label>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" variant="primary" size="md" loading={isSubmitting} disabled={!isDirty}>Save Changes</Button>
      </div>
    </form>
  );
}

// ─── Unified export ───────────────────────────────────────────────────────────

export function UserForm(props: UserFormProps) {
  if (props.mode === 'create') return <CreateForm {...props} />;
  return <EditForm {...props} />;
}
