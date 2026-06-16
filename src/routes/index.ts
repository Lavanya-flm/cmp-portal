import { Router } from 'express';
import { healthRouter } from './health.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { courseRouter } from '../modules/course/course.routes';
import { batchNestedRouter, batchFlatRouter } from '../modules/batch/batch.routes';
import { userRouter } from '../modules/user/user.routes';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes';

const router = Router();

// ─── Core routes ──────────────────────────────────────────────
router.use('/health', healthRouter);

// ─── Auth ─────────────────────────────────────────────────────
router.use('/auth', authRouter);

// ─── Users ────────────────────────────────────────────────────
router.use('/users', userRouter);

// ─── Courses (includes nested batch routes) ───────────────────
router.use('/courses', courseRouter);
router.use(
  '/courses/:courseId/batches',
  batchNestedRouter
);   // POST|GET /courses/:courseId/batches

// ─── Batches (flat single-resource routes) ────────────────────
router.use('/batches', batchFlatRouter);     // GET|PUT|DELETE /batches/:id

// ─── Dashboard ────────────────────────────────────────────────
router.use('/dashboard', dashboardRouter);

export { router };
