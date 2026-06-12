import { Request, Response, NextFunction } from 'express';
import { batchService } from './batch.service';
import { sendSuccess, sendPaginated } from '../../core/utils/response.util';
import { CreateBatchDto, UpdateBatchDto, BatchQueryDto } from './batch.types';

export class BatchController {
  /**
   * POST /courses/:courseId/batches
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const dto = req.body as CreateBatchDto;
      const batch = await batchService.createBatch(courseId, dto);
      sendSuccess(res, batch, 'Batch created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses/:courseId/batches
   */
  async findByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const query = req.query as unknown as BatchQueryDto;
      const { batches, meta } = await batchService.getBatchesByCourse(courseId, query);
      sendPaginated(res, batches, meta, 'Batches retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /batches/:id
   */
  async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const batch = await batchService.getBatchById(id);
      sendSuccess(res, batch, 'Batch retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /batches/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateBatchDto;
      const batch = await batchService.updateBatch(id, dto);
      sendSuccess(res, batch, 'Batch updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /batches/:id
   */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await batchService.deleteBatch(id);
      sendSuccess(res, null, 'Batch deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

const controller = new BatchController();
export const batchController = {
  create: controller.create.bind(controller),
  findByCourse: controller.findByCourse.bind(controller),
  findOne: controller.findOne.bind(controller),
  update: controller.update.bind(controller),
  remove: controller.remove.bind(controller),
};
