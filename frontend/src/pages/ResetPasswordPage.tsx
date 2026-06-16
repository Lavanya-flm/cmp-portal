import { AuthLayout } from '../layouts/AuthLayout';
import { ResetPasswordForm } from '../features/auth/ResetPasswordForm';

export function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
