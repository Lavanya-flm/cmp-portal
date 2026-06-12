import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '../core/logger';

// Prisma v5 generic type workaround for event-based logging
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrismaClient = PrismaClient & { $on: (event: string, cb: (e: any) => void) => void };

const globalForPrisma = globalThis as unknown as { prisma: AnyPrismaClient };

function createPrismaClient(): AnyPrismaClient {
  return new PrismaClient({
    log:
      env.nodeEnv === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  }) as unknown as AnyPrismaClient;
}

export const prisma: AnyPrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Log slow queries in development
if (env.nodeEnv === 'development') {
  prisma.$on('query', (e: { query: string; duration: number }) => {
    if (e.duration > 500) {
      logger.warn('Slow query detected', {
        query: e.query,
        duration: `${e.duration}ms`,
      });
    }
  });
}

prisma.$on('error', (e: { message: string }) => {
  logger.error('Prisma error', { message: e.message });
});

export async function connectDatabase(): Promise<void> {
  try {
    await (prisma as PrismaClient).$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed', { error });
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await (prisma as PrismaClient).$disconnect();
  logger.info('Database disconnected');
}
