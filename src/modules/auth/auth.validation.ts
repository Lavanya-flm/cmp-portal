import Joi from 'joi';

// ─── Reusable strong password ─────────────────────────────────────────────────

const strongPassword = Joi.string()
  .min(8)
  .max(100)
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/[0-9]/, 'number')
  .pattern(/[@$!%*?&]/, 'special')
  .required()
  .messages({
    'string.min':         'Password must be at least 8 characters',
    'string.pattern.name': 'Password must contain at least one {#name} character',
    'string.empty':       'Password is required',
    'any.required':       'Password is required',
  });

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(1).required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: strongPassword,
});

// ─── Forgot password ──────────────────────────────────────────────────────────

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
});

// ─── Reset password ───────────────────────────────────────────────────────────

export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    'string.empty': 'Reset token is required',
    'any.required': 'Reset token is required',
  }),
  newPassword: strongPassword,
});

// ─── Refresh token ────────────────────────────────────────────────────────────

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().trim().required().messages({
    'string.empty': 'Refresh token is required',
    'any.required': 'Refresh token is required',
  }),
});
