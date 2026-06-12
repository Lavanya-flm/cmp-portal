import { Router } from 'express';
import { batchController } from './batch.controller';
import { validate } from '../../core/middleware/validate.middleware';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { Role } from '../../core/types';
import {
  createBatchSchema,
  updateBatchSchema,
  batchQuerySchema,
  batchIdParamSchema,
  courseIdParamSchema,
} from './batch.validation';

/**
 * @swagger
 * tags:
 *   name: Batches
 *   description: Batch management — each batch belongs to a course and contains a trainer and resource links
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Trainer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "+1-555-0100"
 *         experience:
 *           type: integer
 *           nullable: true
 *           example: 8
 *         currentCompany:
 *           type: string
 *           nullable: true
 *           example: Acme Corp
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     BatchLinks:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         syllabusLink:
 *           type: string
 *           format: uri
 *           nullable: true
 *         projectsLink:
 *           type: string
 *           format: uri
 *           nullable: true
 *         trainerDemoRecording:
 *           type: string
 *           format: uri
 *           nullable: true
 *         liveDemoRecording1:
 *           type: string
 *           format: uri
 *           nullable: true
 *         liveDemoRecording2:
 *           type: string
 *           format: uri
 *           nullable: true
 *         paymentLink:
 *           type: string
 *           format: uri
 *           nullable: true
 *         whatsappGroupLink:
 *           type: string
 *           format: uri
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Batch:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         courseId:
 *           type: string
 *           format: uuid
 *         batchNumber:
 *           type: integer
 *           example: 1
 *         batchName:
 *           type: string
 *           example: "Batch 1 - Morning"
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2026-07-01"
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2026-10-01"
 *         price:
 *           type: number
 *           format: float
 *           example: 4999.99
 *         supportEmail:
 *           type: string
 *           format: email
 *           example: support@cmp.io
 *         trainer:
 *           $ref: '#/components/schemas/Trainer'
 *         batchLinks:
 *           $ref: '#/components/schemas/BatchLinks'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateTrainerRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "+1-555-0100"
 *         experience:
 *           type: integer
 *           nullable: true
 *           example: 8
 *         currentCompany:
 *           type: string
 *           nullable: true
 *           example: Acme Corp
 *
 *     CreateBatchLinksRequest:
 *       type: object
 *       properties:
 *         syllabusLink:
 *           type: string
 *           format: uri
 *           nullable: true
 *         projectsLink:
 *           type: string
 *           format: uri
 *           nullable: true
 *         trainerDemoRecording:
 *           type: string
 *           format: uri
 *           nullable: true
 *         liveDemoRecording1:
 *           type: string
 *           format: uri
 *           nullable: true
 *         liveDemoRecording2:
 *           type: string
 *           format: uri
 *           nullable: true
 *         paymentLink:
 *           type: string
 *           format: uri
 *           nullable: true
 *         whatsappGroupLink:
 *           type: string
 *           format: uri
 *           nullable: true
 *
 *     CreateBatchRequest:
 *       type: object
 *       required:
 *         - batchNumber
 *         - batchName
 *         - startDate
 *         - price
 *         - supportEmail
 *         - trainer
 *       properties:
 *         batchNumber:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         batchName:
 *           type: string
 *           example: "Batch 1 - Morning"
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2026-07-01"
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2026-10-01"
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 4999.99
 *         supportEmail:
 *           type: string
 *           format: email
 *           example: support@cmp.io
 *         trainer:
 *           $ref: '#/components/schemas/CreateTrainerRequest'
 *         batchLinks:
 *           $ref: '#/components/schemas/CreateBatchLinksRequest'
 *
 *     UpdateBatchRequest:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         batchName:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         price:
 *           type: number
 *           minimum: 0
 *         supportEmail:
 *           type: string
 *           format: email
 *         trainer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *             phone:
 *               type: string
 *               nullable: true
 *             experience:
 *               type: integer
 *               nullable: true
 *             currentCompany:
 *               type: string
 *               nullable: true
 *         batchLinks:
 *           $ref: '#/components/schemas/CreateBatchLinksRequest'
 */

// ─── Nested router: mounts under /courses/:courseId/batches ──────────────────
// mergeParams: true makes :courseId visible inside this router
const nestedRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /courses/{courseId}/batches:
 *   post:
 *     summary: Create a batch for a course
 *     description: |
 *       Creates a **Batch**, its **Trainer**, and its **BatchLinks** atomically
 *       in a single database transaction. If any step fails, all changes are
 *       rolled back — no partial records are ever persisted.
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Parent course UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBatchRequest'
 *           example:
 *             batchNumber: 1
 *             batchName: "Batch 1 - Morning"
 *             startDate: "2026-07-01"
 *             endDate: "2026-10-01"
 *             price: 4999.99
 *             supportEmail: support@cmp.io
 *             trainer:
 *               name: John Doe
 *               email: john@example.com
 *               phone: "+1-555-0100"
 *               experience: 8
 *               currentCompany: Acme Corp
 *             batchLinks:
 *               syllabusLink: "https://example.com/syllabus.pdf"
 *               paymentLink: "https://payment.example.com/batch1"
 *               whatsappGroupLink: "https://chat.whatsapp.com/abc123"
 *     responses:
 *       201:
 *         description: Batch created successfully (with trainer and links)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Batch'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Batch number already exists for this course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
nestedRouter.post(
  '/',
  authenticate,
  requireRole(Role.SUPER_ADMIN, Role.SUB_ADMIN),
  validate(courseIdParamSchema, 'params'),
  validate(createBatchSchema),
  batchController.create,
);

/**
 * @swagger
 * /courses/{courseId}/batches:
 *   get:
 *     summary: List all batches for a course
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Parent course UUID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [batchNumber, startDate, createdAt]
 *           default: batchNumber
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Batches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     statusCode:
 *                       type: integer
 *                       example: 200
 *                     message:
 *                       type: string
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Batch'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
nestedRouter.get(
  '/',
  authenticate,
  validate(courseIdParamSchema, 'params'),
  validate(batchQuerySchema, 'query'),
  batchController.findByCourse,
);

// ─── Flat router: mounts at /batches — for single-resource operations ─────────
const flatRouter = Router();

/**
 * @swagger
 * /batches/{id}:
 *   get:
 *     summary: Get a batch by ID
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Batch UUID
 *     responses:
 *       200:
 *         description: Batch retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Batch'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
flatRouter.get(
  '/:id',
  authenticate,
  validate(batchIdParamSchema, 'params'),
  batchController.findOne,
);

/**
 * @swagger
 * /batches/{id}:
 *   put:
 *     summary: Update a batch
 *     description: |
 *       Updates batch fields and optionally updates the trainer and/or batch links
 *       in the same transaction. Only supply the fields you want to change.
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Batch UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBatchRequest'
 *     responses:
 *       200:
 *         description: Batch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Batch'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
flatRouter.put(
  '/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN, Role.SUB_ADMIN),
  validate(batchIdParamSchema, 'params'),
  validate(updateBatchSchema),
  batchController.update,
);

/**
 * @swagger
 * /batches/{id}:
 *   delete:
 *     summary: Delete a batch
 *     description: |
 *       Permanently deletes the batch. Trainer and BatchLinks are removed by cascade.
 *       **Requires SUPER_ADMIN role.**
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Batch UUID
 *     responses:
 *       200:
 *         description: Batch deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
flatRouter.delete(
  '/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  validate(batchIdParamSchema, 'params'),
  batchController.remove,
);

export { nestedRouter as batchNestedRouter, flatRouter as batchFlatRouter };
