import Joi from 'joi';

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

// ─── Refresh token ────────────────────────────────────────────────────────────

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().trim().required().messages({
    'string.empty': 'Refresh token is required',
    'any.required': 'Refresh token is required',
  }),
});

// ─── Register ─────────────────────────────────────────────────────────────────

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PASSWORD_MSG =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&)';

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
  password: Joi.string().pattern(PASSWORD_PATTERN).required().messages({
    'string.pattern.base': PASSWORD_MSG,
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
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
  newPassword: Joi.string().pattern(PASSWORD_PATTERN).required().messages({
    'string.pattern.base': PASSWORD_MSG,
    'string.empty': 'New password is required',
    'any.required': 'New password is required',
  }),
});
