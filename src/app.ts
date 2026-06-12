import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { router } from './routes';
import { errorHandler, notFoundHandler } from './core/errors/errorHandler';
import { requestIdMiddleware } from './core/middleware/requestId.middleware';
import { globalRateLimiter } from './core/middleware/rateLimiter.middleware';
import { morganStream } from './core/logger';

export function createApp(): Application {
  const app = express();

  // ─── Security headers ────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (env.cors.origins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: Origin ${origin} not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    }),
  );

  // ─── Request ID ──────────────────────────────────────────────
  app.use(requestIdMiddleware);

  // ─── Body parsing ────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // ─── Compression ─────────────────────────────────────────────
  app.use(compression());

  // ─── HTTP request logging ────────────────────────────────────
  app.use(
    morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
      stream: morganStream,
    }),
  );

  // ─── Rate limiting ───────────────────────────────────────────
  app.use(globalRateLimiter);

  // ─── Swagger docs ────────────────────────────────────────────
  if (env.nodeEnv !== 'production') {
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'CMP API Docs',
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
          persistAuthorization: true,
        },
      }),
    );
  }

  // ─── API routes ──────────────────────────────────────────────
  app.use(env.apiPrefix, router);

  // ─── 404 handler ─────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Global error handler ────────────────────────────────────
  app.use(errorHandler);

  return app;
}
