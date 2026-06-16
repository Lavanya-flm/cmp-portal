import { AuthLayout } from '../layouts/AuthLayout';
import { ForgotPasswordForm } from '../features/auth/ForgotPasswordForm';

export function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
