import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordSchema, ForgotPasswordFormValues } from './auth.schema';
import { useForgotPassword } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorBanner } from '../../components/auth/ErrorBanner';
import { getErrorMessage } from '../../utils/format';
import { ROUTES } from '../../utils/constants';

export function ForgotPasswordForm() {
  const navigate = useNavigate();

  const { mutate: forgotPassword, isPending, error, reset: resetMutation, isSuccess } = useForgotPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    resetMutation();
    forgotPassword(data);
  };

  const serverError = error ? getErrorMessage(error) : null;
  if (isSuccess) {
    return (
      <div className="rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-200/80 text-center">
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 size={26} className="text-green-500" />
          </div>
        </div>

        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          Password reset link sent
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          If an account exists with this email address,
          <br />a password reset link has been sent.
          <br />Please check your inbox.
        </p>

        <Button
          variant="secondary"
          size="md"
          fullWidth
          className="mt-8"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  // ── Form state ─────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl bg-white px-8 py-9 shadow-sm ring-1 ring-gray-200/80">
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-gray-900">
          Reset password
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      {serverError && (
        <div className="mb-5">
          <ErrorBanner message={serverError} onDismiss={resetMutation} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          autoFocus
          leftIcon={<Mail size={15} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isPending}
          className="mt-1 font-semibold"
        >
          {isPending ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remember your password?{' '}
        <button
          type="button"
          onClick={() => navigate(ROUTES.LOGIN)}
          className="font-semibold text-amber-500 hover:text-amber-600 transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
