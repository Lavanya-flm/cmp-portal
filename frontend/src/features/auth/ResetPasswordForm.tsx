import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordSchema, ResetPasswordFormValues } from './auth.schema';
import { useResetPassword } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { ErrorBanner } from '../../components/auth/ErrorBanner';
import { getErrorMessage } from '../../utils/format';
import { ROUTES } from '../../utils/constants';

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Token is read silently from URL — never shown to the user
  const tokenFromUrl = searchParams.get('token') ?? '';

  const { mutate: resetPassword, isPending, error, reset: resetMutation } = useResetPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    resetMutation();
    // Token passed programmatically — not from a visible form field
    resetPassword({ token: tokenFromUrl, newPassword: data.newPassword });
  };

  const serverError = error ? getErrorMessage(error) : null;

  return (
    <div className="rounded-2xl bg-white px-8 py-10 shadow-lg shadow-gray-100/80 ring-1 ring-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reset password</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Choose a new password for your account.
        </p>
      </div>

      {serverError && (
        <div className="mb-6"><ErrorBanner message={serverError} onDismiss={resetMutation} /></div>
      )}

      {/* Token missing warning */}
      {!tokenFromUrl && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No reset token found. Please use the link from your reset instructions.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div>
          <PasswordInput
            label="New password"
            id="new-password"
            placeholder="New password"
            autoComplete="new-password"
            autoFocus
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Min 8 characters · uppercase · lowercase · number · special character
          </p>
        </div>

        <PasswordInput
          label="Confirm password"
          id="confirm-new-password"
          placeholder="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isPending}
          disabled={!tokenFromUrl}
          className="mt-2 font-semibold"
        >
          {isPending ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remembered your password?{' '}
        <button type="button" onClick={() => navigate(ROUTES.LOGIN)}
          className="font-semibold text-amber-500 hover:text-amber-600 transition-colors">
          Sign in
        </button>
      </p>
    </div>
  );
}
