import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../utils/constants';
import type { Role } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Optional role restriction — redirects to dashboard if role not allowed */
  allowedRoles?: Role[];
}

/**
 * Wraps any route that requires authentication.
 * Unauthenticated users are redirected to /login with the original path saved.
 * Optionally restricts by role — unauthorised users land on dashboard.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
