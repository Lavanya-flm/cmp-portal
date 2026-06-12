import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../utils/constants';

interface GuestRouteProps {
  children: ReactNode;
}

/**
 * Wraps public-only routes (e.g. /login).
 * Authenticated users are redirected to their original destination
 * or the dashboard if no prior location is stored.
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
