import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginSchema, LoginFormValues } from './auth.schema';
import { useLogin } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { ErrorBanner } from '../../components/auth/ErrorBanner';
import { getErrorMessage } from '../../utils/format';
import { ROUTES } from '../../utils/constants';

export function LoginForm() {
  const navigate = useNavigate();
  const { mutate: login, isPending, error, reset: resetMutation } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = (data: LoginFormValues) => {
    resetMutation();
    login({ email: data.email, password: data.password, rememberMe: data.rememberMe });
  };

  const serverError = error ? getErrorMessage(error) : null;

  return (
    <div className="rounded-2xl bg-white px-8 py-9 shadow-sm ring-1 ring-gray-200/80">
      {/* Heading */}
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-gray-900">
          Sign in
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Welcome back to CMP Portal
        </p>
      </div>

      {serverError && (
        <div className="mb-5">
          <ErrorBanner message={serverError} onDismiss={resetMutation} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* Email */}
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

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <button
              type="button"
              onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
              className="text-sm font-medium text-amber-500 hover:text-amber-600 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <PasswordInput
            id="password"
            placeholder="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        {/* Remember me */}
        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 accent-amber-500 focus:ring-amber-400 focus:ring-offset-0"
            {...register('rememberMe')}
          />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isPending}
          className="mt-1 font-semibold"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => navigate(ROUTES.REGISTER)}
          className="font-semibold text-amber-500 hover:text-amber-600 transition-colors"
        >
          Create account
        </button>
      </p>
    </div>
  );
}
