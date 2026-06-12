import { useAuthStore } from '../store/auth.store';
import type { Role } from '../types';

/**
 * Returns true when the current user has at least one of the given roles.
 *
 * Usage:
 *   const canDelete = useHasRole('SUPER_ADMIN');
 *   const canEdit   = useHasRole('SUPER_ADMIN', 'SUB_ADMIN');
 */
export function useHasRole(...roles: Role[]): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Returns the current user's role, or null when unauthenticated.
 */
export function useRole(): Role | null {
  return useAuthStore((s) => s.user?.role ?? null);
}

/**
 * Returns true only when the current user is a SUPER_ADMIN.
 */
export function useIsSuperAdmin(): boolean {
  return useHasRole('SUPER_ADMIN');
}

/**
 * Returns true for SUPER_ADMIN or SUB_ADMIN.
 */
export function useIsAdmin(): boolean {
  return useHasRole('SUPER_ADMIN', 'SUB_ADMIN');
}
