import { z } from 'zod';

// ─── Reusable trimmed string ──────────────────────────────────────────────────
// Treats whitespace-only values as empty so required validation fires correctly.

const trimmedString = (label: string) =>
  z.string()
    .transform((v) => v.trim())
    .pipe(z.string().min(1, `${label} is required`));

const strongPassword = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[@$!%*?&]/, 'Must contain at least one special character (@$!%*?&)');

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:      z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password:   z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    firstName:       trimmedString('First name').pipe(z.string().max(100)),
    lastName:        trimmedString('Last name').pipe(z.string().max(100)),
    email:           z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password:        strongPassword,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Forgot password ──────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ─── Reset password — token read from URL, not from form field ────────────────

export const resetPasswordSchema = z
  .object({
    newPassword:     strongPassword,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
