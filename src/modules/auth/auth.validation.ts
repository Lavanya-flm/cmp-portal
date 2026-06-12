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
