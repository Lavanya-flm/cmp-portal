import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerSchema, RegisterFormValues } from './auth.schema';
import { useRegister } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { ErrorBanner } from '../../components/auth/ErrorBanner';
import { getErrorMessage } from '../../utils/format';
import { ROUTES } from '../../utils/constants';

export function RegisterForm() {
  const navigate = useNavigate();
  const { mutate: register, isPending, error, reset: resetMutation } = useRegister();

  const { register: rhfRegister, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    resetMutation();
    register({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password });
  };

  const serverError = error ? getErrorMessage(error) : null;

  return (
    <div className="rounded-2xl bg-white px-8 py-9 shadow-sm ring-1 ring-gray-200/80">
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-gray-900">
          Create account
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Join CMP Portal as a learner
        </p>
      </div>

      {serverError && (
        <div className="mb-5">
          <ErrorBanner message={serverError} onDismiss={resetMutation} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* Name — no icons */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="First name"
            autoFocus
            error={errors.firstName?.message}
            {...rhfRegister('firstName')}
          />
          <Input
            label="Last name"
            placeholder="Last name"
            error={errors.lastName?.message}
            {...rhfRegister('lastName')}
          />
        </div>

        {/* Email — with icon */}
        <Input
          label="Email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          leftIcon={<Mail size={15} />}
          error={errors.email?.message}
          {...rhfRegister('email')}
        />

        {/* Password — with eye-toggle icon */}
        <PasswordInput
          label="Password"
          id="reg-password"
          placeholder="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...rhfRegister('password')}
        />

        {/* Confirm password */}
        <PasswordInput
          label="Confirm password"
          id="reg-confirm-password"
          placeholder="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...rhfRegister('confirmPassword')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isPending}
          className="mt-1 font-semibold"
        >
          {isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
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
