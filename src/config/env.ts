import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  nodeEnv: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',

  database: {
    url: requireEnv('DATABASE_URL'),
  },

  jwt: {
    accessSecret:    requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret:   requireEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN  ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max:      parseInt(process.env.RATE_LIMIT_MAX       ?? '100',    10),
  },

  logger: {
    level: process.env.LOG_LEVEL ?? 'debug',
    dir:   process.env.LOG_DIR   ?? 'logs',
  },

  email: {
    resendApiKey:          process.env.RESEND_API_KEY ?? '',
    from:                  process.env.EMAIL_FROM     ?? 'Frontlines Edutech <noreply@frontlinesedutech.com>',
    frontendUrl:           process.env.FRONTEND_URL   ?? 'http://localhost:5173',
    passwordResetExpiresMins: parseInt(process.env.PASSWORD_RESET_EXPIRES_MINUTES ?? '30', 10),
  },
} as const;

// ─── Startup warning — email disabled when key is missing / placeholder ───────

(function warnIfEmailDisabled() {
  const key = env.email.resendApiKey;
  const isPlaceholder = !key || key === 're_your_api_key_here' || key.startsWith('re_your');
  if (isPlaceholder) {
    // eslint-disable-next-line no-console
    console.warn(
      '⚠️  [Email] RESEND_API_KEY is not configured. ' +
      'Password reset emails will NOT be delivered. ' +
      'Set RESEND_API_KEY in .env to enable.',
    );
  }
})();
