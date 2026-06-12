import { Role } from '../types';

/**
 * Format an ISO date string to a readable date.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format an ISO date string to a readable date + time.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a price number to a currency string.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

/**
 * Map a Role enum value to a human-readable label.
 */
export function formatRole(role: Role): string {
  const map: Record<Role, string> = {
    SUPER_ADMIN: 'Super Admin',
    SUB_ADMIN: 'Sub Admin',
    USER: 'User',
  };
  return map[role] ?? role;
}

/**
 * Get a user's full display name.
 */
export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Extract an Axios / API error message safely.
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    // Axios error shape
    if (e.response && typeof e.response === 'object') {
      const res = e.response as Record<string, unknown>;
      if (res.data && typeof res.data === 'object') {
        const data = res.data as Record<string, unknown>;
        if (typeof data.message === 'string') return data.message;
      }
    }
    if (typeof e.message === 'string') return e.message;
  }
  return 'An unexpected error occurred';
}
