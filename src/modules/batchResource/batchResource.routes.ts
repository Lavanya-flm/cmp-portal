import { Router } from 'express';
import { batchResourceController } from './batchResource.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { Role } from '../../core/types';
import {
  createBatchResourceSchema,
  batchResourceIdParamSchema,
  batchIdParamSchemaRes,
} from './batchResource.validation';

const router = Router({ mergeParams: true }); // inherits :batchId from parent

// GET /batches/:batchId/resources — all authenticated
router.get(
  '/',
  authenticate,
  validate(batchIdParamSchemaRes, 'params'),
  batchResourceController.findAll,
);

// GET /batches/:batchId/resources/:resourceId
router.get(
  '/:resourceId',
  authenticate,
  validate(batchResourceIdParamSchema, 'params'),
  batchResourceController.findOne,
);

// POST /batches/:batchId/resources — admin only
router.post(
  '/',
  authenticate,
  requireRole(Role.SUPER_ADMIN, Role.SUB_ADMIN),
  validate(batchIdParamSchemaRes, 'params'),
  validate(createBatchResourceSchema),
  batchResourceController.create,
);

// DELETE /batches/:batchId/resources/:resourceId — admin only
router.delete(
  '/:resourceId',
  authenticate,
  requireRole(Role.SUPER_ADMIN, Role.SUB_ADMIN),
  validate(batchResourceIdParamSchema, 'params'),
  batchResourceController.remove,
);

export { router as batchResourceRouter };
