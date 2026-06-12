import Joi from 'joi';
import { Role } from '../../core/types';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PASSWORD_MSG =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';

const VALID_ROLES = Object.values(Role);

// ─── Create User ──────────────────────────────────────────────────────────────

export const createUserSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string().pattern(PASSWORD_PATTERN).required().messages({
    'string.pattern.base': PASSWORD_MSG,
    'any.required': 'Password is required',
  }),
  firstName: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required',
  }),
  role: Joi.string()
    .valid(...VALID_ROLES)
    .required()
    .messages({
      'any.only': `Role must be one of: ${VALID_ROLES.join(', ')}`,
      'any.required': 'Role is required',
    }),
});

// ─── Update User (admin) ──────────────────────────────────────────────────────

export const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).optional(),
  lastName: Joi.string().trim().min(1).max(100).optional(),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// ─── Update My Profile (self) ─────────────────────────────────────────────────

export const updateMyProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).optional(),
  lastName: Joi.string().trim().min(1).max(100).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided',
});

// ─── Change Role ──────────────────────────────────────────────────────────────

export const changeRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...VALID_ROLES)
    .required()
    .messages({
      'any.only': `Role must be one of: ${VALID_ROLES.join(', ')}`,
      'any.required': 'Role is required',
    }),
});

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).required().messages({
    'string.empty': 'Current password is required',
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().pattern(PASSWORD_PATTERN).required().messages({
    'string.pattern.base': PASSWORD_MSG,
    'any.required': 'New password is required',
  }),
});

// ─── List Users query ─────────────────────────────────────────────────────────

export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).optional().allow(''),
  sortBy: Joi.string()
    .valid('firstName', 'lastName', 'email', 'createdAt')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// ─── UUID param ───────────────────────────────────────────────────────────────

export const userIdParamSchema = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required',
  }),
});
