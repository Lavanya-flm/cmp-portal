import { Request, Response, NextFunction } from 'express';
import { batchResourceService } from './batchResource.service';
import { sendSuccess } from '../../core/utils/response.util';
import { CreateBatchResourceDto } from './batchResource.types';

export class BatchResourceController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchId } = req.params;
      const dto = req.body as CreateBatchResourceDto;
      const resource = await batchResourceService.create(batchId, dto);
      sendSuccess(res, resource, 'Resource uploaded successfully', 201);
    } catch (err) { next(err); }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchId } = req.params;
      const resources = await batchResourceService.getAllByBatch(batchId);
      sendSuccess(res, resources, 'Resources retrieved successfully');
    } catch (err) { next(err); }
  }

  async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchId, resourceId } = req.params;
      const resource = await batchResourceService.getById(batchId, resourceId);
      sendSuccess(res, resource, 'Resource retrieved successfully');
    } catch (err) { next(err); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchId, resourceId } = req.params;
      await batchResourceService.delete(batchId, resourceId);
      sendSuccess(res, null, 'Resource deleted successfully');
    } catch (err) { next(err); }
  }
}

const ctrl = new BatchResourceController();
export const batchResourceController = {
  create:  ctrl.create.bind(ctrl),
  findAll: ctrl.findAll.bind(ctrl),
  findOne: ctrl.findOne.bind(ctrl),
  remove:  ctrl.remove.bind(ctrl),
};
