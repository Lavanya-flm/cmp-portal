import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './core/logger';

async function bootstrap(): Promise<void> {
  // Connect to DB before starting the server
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.port, () => {
    logger.info(`🚀 Server running`, {
      port: env.port,
      environment: env.nodeEnv,
      apiPrefix: env.apiPrefix,
      docs: env.nodeEnv !== 'production' ? `http://localhost:${env.port}/api-docs` : 'disabled',
    });
  });

  // ─── Graceful shutdown ────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDatabase();
      logger.info('Shutdown complete');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ─── Unhandled rejections ─────────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception — shutting down', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
