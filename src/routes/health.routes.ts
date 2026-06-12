import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { env } from '../config/env';

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health check
 */

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check including DB connectivity
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service and dependencies are healthy
 *       503:
 *         description: One or more dependencies are unhealthy
 */
router.get('/detailed', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};
  let allHealthy = true;

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
    allHealthy = false;
  }

  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: allHealthy,
    status: allHealthy ? 'ok' : 'degraded',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    checks,
  });
});

export { router as healthRouter };
