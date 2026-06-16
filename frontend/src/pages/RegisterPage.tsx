import { AuthLayout } from '../layouts/AuthLayout';
import { RegisterForm } from '../features/auth/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout wide>
      <RegisterForm />
    </AuthLayout>
  );
}
