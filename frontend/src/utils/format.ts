import { isAxiosError } from 'axios';
import { Role } from '../types';

// ─── Date / currency / role formatters ───────────────────────────────────────

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatRole(role: Role): string {
  const map: Record<Role, string> = {
    SUPER_ADMIN: 'Super Admin',
    SUB_ADMIN:   'Sub Admin',
    USER:        'User',
  };
  return map[role] ?? role;
}

export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

// ─── Technical → human message mapping ───────────────────────────────────────

const TECHNICAL_PATTERNS: Array<[RegExp, string | ((m: RegExpMatchArray) => string)]> = [
  // URI / URL
  [/must be a valid uri/i,             'Please enter a valid URL (starting with https://)'],
  [/must be a valid url/i,             'Please enter a valid URL'],
  // Email
  [/must be a valid email/i,           'Please enter a valid email address'],
  // Required
  [/is required/i,                     'This field is required'],
  [/must not be empty/i,               'This field is required'],
  [/is not allowed to be empty/i,      'This field is required'],
  // Length — min
  [/must be at least (\d+) characters/i,  (m) => `Must be at least ${m[1]} characters`],
  [/length must be at least (\d+)/i,      (m) => `Must be at least ${m[1]} characters`],
  [/must contain at least (\d+)/i,        (m) => `Must contain at least ${m[1]} characters`],
  // Length — max
  [/must not exceed (\d+) characters/i,  (m) => `Must not exceed ${m[1]} characters`],
  [/length must be less than or equal to (\d+)/i, (m) => `Must not exceed ${m[1]} characters`],
  // Number range
  [/must be greater than or equal to (\d+)/i, (m) => `Must be at least ${m[1]}`],
  [/must be less than or equal to (\d+)/i,    (m) => `Must be no more than ${m[1]}`],
  [/must be greater than (\d+)/i,             (m) => `Must be greater than ${m[1]}`],
  [/must be less than (\d+)/i,                (m) => `Must be less than ${m[1]}`],
  // Type
  [/must be a number/i,                'Please enter a valid number'],
  [/must be a string/i,                'Please enter a valid value'],
  [/must be a boolean/i,               'Please select a valid option'],
  // Date
  [/must be a valid iso date/i,        'Please enter a valid date (YYYY-MM-DD)'],
  // Enum / allowed values
  [/must be one of/i,                  'Please select a valid option'],
  // Duplicate
  [/already exists/i,                  (m) => m[0]],   // keep as-is — it's already friendly
  // Generic validation
  [/validation failed/i,               'Please correct the highlighted fields.'],
  [/unprocessable entity/i,            'Please correct the highlighted fields.'],
  [/invalid data/i,                    'Please correct the highlighted fields.'],
];

function humaniseMessage(raw: string): string {
  for (const [pattern, replacement] of TECHNICAL_PATTERNS) {
    const match = raw.match(pattern);
    if (match) {
      return typeof replacement === 'function' ? replacement(match) : replacement;
    }
  }
  return raw;
}

// ─── Field-level error extraction ────────────────────────────────────────────

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Extract field-level validation errors from a backend 422 response.
 * Returns an array of { field, message } objects.
 */
export function getFieldErrors(error: unknown): FieldError[] {
  if (!isAxiosError(error)) return [];
  const data = error.response?.data as Record<string, unknown> | undefined;
  if (!data) return [];

  // Standard CMP API format: { errors: [{ field, message }] }
  if (Array.isArray(data.errors)) {
    return (data.errors as Array<{ field?: string; message?: string }>)
      .filter((e) => e.field && e.message)
      .map((e) => ({
        field:   e.field!,
        message: humaniseMessage(e.message!),
      }));
  }

  return [];
}

// ─── Top-level error message ──────────────────────────────────────────────────

/**
 * Convert any error into a single human-readable string for display in an
 * ErrorBanner or toast. Never returns raw technical messages.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return '';

  if (isAxiosError(error)) {
    // Network / CORS / server unreachable
    if (!error.response) {
      return 'Unable to connect to the server. Please check your connection and try again.';
    }

    const status = error.response.status;
    const data   = error.response.data as Record<string, unknown> | undefined;

    // 422 Validation — check if there are field-level errors to surface
    if (status === 422) {
      if (Array.isArray(data?.errors) && (data.errors as unknown[]).length > 0) {
        return 'Please correct the highlighted fields.';
      }
      // Single message
      if (typeof data?.message === 'string') return humaniseMessage(data.message);
      return 'Please correct the highlighted fields.';
    }

    // 400 Bad request
    if (status === 400) {
      if (typeof data?.message === 'string') return humaniseMessage(data.message);
      return 'The request was invalid. Please check your input.';
    }

    // 401 / 403
    if (status === 401) return 'Invalid email or password. Please try again.';
    if (status === 403) return 'You do not have permission to perform this action.';

    // 404
    if (status === 404) {
      if (typeof data?.message === 'string') return data.message;
      return 'The requested resource was not found.';
    }

    // 409 Conflict (duplicate name, etc.)
    if (status === 409) {
      if (typeof data?.message === 'string') return data.message;
      return 'This record already exists. Please use a different value.';
    }

    // 5xx
    if (status >= 500) {
      return 'Something went wrong on our end. Please try again later.';
    }

    // Other — humanise whatever message comes back
    if (typeof data?.message === 'string') return humaniseMessage(data.message);
  }

  // Non-Axios error
  if (error instanceof Error) return humaniseMessage(error.message);

  return 'An unexpected error occurred. Please try again.';
}
