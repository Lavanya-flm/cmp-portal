import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { Role } from '../../core/types';

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Aggregated statistics and recent activity for admin panels
 */

const router = Router();

// All dashboard routes require authentication + SUPER_ADMIN or SUB_ADMIN
const adminGuard = [authenticate, requireRole(Role.SUPER_ADMIN, Role.SUB_ADMIN)];

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Unified dashboard
 *     description: |
 *       Returns all dashboard data in a single request.
 *       The `summary` field is populated for SUPER_ADMIN and SUB_ADMIN roles;
 *       it is `null` for USER role.
 *       All three internal data sets are fetched concurrently.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                           enum: [SUPER_ADMIN, SUB_ADMIN, USER]
 *                           example: SUPER_ADMIN
 *                         summary:
 *                           nullable: true
 *                           type: object
 *                           properties:
 *                             totalCourses:     { type: integer, example: 12 }
 *                             totalBatches:     { type: integer, example: 34 }
 *                             liveBatches:      { type: integer, example: 5  }
 *                             upcomingBatches:  { type: integer, example: 10 }
 *                             completedBatches: { type: integer, example: 19 }
 *                             totalUsers:       { type: integer, example: 87 }
 *                         recentCourses:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:           { type: string, format: uuid }
 *                               name:         { type: string }
 *                               totalBatches: { type: integer }
 *                               createdAt:    { type: string, format: date-time }
 *                         recentBatches:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:             { type: string, format: uuid }
 *                               batchName:      { type: string }
 *                               batchMonthYear: { type: string, nullable: true }
 *                               status:         { type: string, enum: [Upcoming, Live, Completed] }
 *                               courseName:     { type: string }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', authenticate, dashboardController.getDashboard);

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Admin summary statistics
 *     description: Returns aggregate counts — total courses, total batches broken down by status, and total active users.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalCourses:     { type: integer, example: 12 }
 *                         totalBatches:     { type: integer, example: 34 }
 *                         liveBatches:      { type: integer, example: 5  }
 *                         upcomingBatches:  { type: integer, example: 10 }
 *                         completedBatches: { type: integer, example: 19 }
 *                         totalUsers:       { type: integer, example: 87 }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/admin', ...adminGuard, dashboardController.adminSummary);

/**
 * @swagger
 * /dashboard/recent-courses:
 *   get:
 *     summary: Recent courses
 *     description: Returns the 5 most recently created courses with their batch counts.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:           { type: string, format: uuid }
 *                           name:         { type: string, example: Excel with AI }
 *                           totalBatches: { type: integer, example: 3 }
 *                           createdAt:    { type: string, format: date-time }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/recent-courses', ...adminGuard, dashboardController.recentCourses);

/**
 * @swagger
 * /dashboard/recent-batches:
 *   get:
 *     summary: Recent batches
 *     description: Returns the 5 most recently created batches with status and parent course name.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent batches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:             { type: string, format: uuid }
 *                           batchName:      { type: string, example: "July 2026 Batch" }
 *                           batchMonthYear: { type: string, nullable: true, example: "July 2026" }
 *                           status:         { type: string, enum: [Upcoming, Live, Completed] }
 *                           courseName:     { type: string, example: Excel with AI }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/recent-batches', ...adminGuard, dashboardController.recentBatches);

export { router as dashboardRouter };
