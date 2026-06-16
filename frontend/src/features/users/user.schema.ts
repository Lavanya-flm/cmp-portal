import { z } from 'zod';

const ROLES = ['SUPER_ADMIN', 'SUB_ADMIN', 'USER'] as const;

// ─── Create User ──────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName:  z.string().min(1, 'Last name is required').max(100),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[@$!%*?&]/, 'Must contain a special character (@$!%*?&)'),
  role: z.enum(ROLES, { required_error: 'Role is required' }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

// ─── Edit User ────────────────────────────────────────────────────────────────

export const editUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName:  z.string().min(1, 'Last name is required').max(100),
  isActive:  z.boolean(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

// ─── Change Role ──────────────────────────────────────────────────────────────

export const changeRoleSchema = z.object({
  role: z.enum(ROLES, { required_error: 'Role is required' }),
});

export type ChangeRoleFormValues = z.infer<typeof changeRoleSchema>;
