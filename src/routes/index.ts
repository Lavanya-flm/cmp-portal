import { Router } from 'express';
import { healthRouter } from './health.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { courseRouter } from '../modules/course/course.routes';
import { batchNestedRouter, batchFlatRouter } from '../modules/batch/batch.routes';
import { userRouter } from '../modules/user/user.routes';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes';
import { batchResourceRouter } from '../modules/batchResource/batchResource.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/courses', courseRouter);
router.use('/courses/:courseId/batches', batchNestedRouter);
router.use('/batches', batchFlatRouter);
router.use('/batches/:batchId/resources', batchResourceRouter);
router.use('/dashboard', dashboardRouter);

export { router };
