import { Decimal } from '@prisma/client/runtime/library';
import { batchRepository } from './batch.repository';
import { courseRepository } from '../course/course.repository';
import { NotFoundError, ConflictError } from '../../core/errors/AppError';
import { logger } from '../../core/logger';
import { buildPaginationMeta } from '../../core/utils/response.util';
import { PaginationMeta } from '../../core/types';
import {
  CreateBatchDto,
  UpdateBatchDto,
  BatchQueryDto,
  BatchWithRelations,
  BatchResponse,
  TrainerResponse,
  BatchLinksResponse,
  FindAllBatchesResult,
} from './batch.types';
import { Trainer, BatchLinks } from '@prisma/client';

// ─── Response mappers ─────────────────────────────────────────────────────────

function toTrainerResponse(t: Trainer): TrainerResponse {
  return {
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    experience: t.experience,
    currentCompany: t.currentCompany,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function toBatchLinksResponse(bl: BatchLinks): BatchLinksResponse {
  return {
    id:                   bl.id,
    syllabusLink:         bl.syllabusLink,
    projectsLink:         bl.projectsLink,
    trainerDemoRecording: bl.trainerDemoRecording,
    liveDemoRecording1:   bl.liveDemoRecording1,
    liveDemoRecording2:   bl.liveDemoRecording2,
    paymentLink:          bl.paymentLink,
    whatsappGroupLink:    bl.whatsappGroupLink,
    communityLink:        bl.communityLink,
    createdAt:            bl.createdAt,
    updatedAt:            bl.updatedAt,
  };
}

function toBatchResponse(b: BatchWithRelations): BatchResponse {
  return {
    id:             b.id,
    courseId:       b.courseId,
    batchNumber:    b.batchNumber,
    batchMonthYear: b.batchMonthYear ?? null,
    batchName:      b.batchName,
    status:         b.status,
    startDate:      b.startDate,
    endDate:        b.endDate,
    price: b.price instanceof Decimal ? b.price.toNumber() : Number(b.price),
    supportEmail:   b.supportEmail,
    trainer:     b.trainer     ? toTrainerResponse(b.trainer)         : null,
    batchLinks:  b.batchLinks  ? toBatchLinksResponse(b.batchLinks)   : null,
    createdAt:   b.createdAt,
    updatedAt:   b.updatedAt,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class BatchService {
  /**
   * Create a batch + trainer + batchLinks in a single transaction.
   * Validates:
   *  - Course exists
   *  - batchNumber is unique within the course
   */
  async createBatch(courseId: string, dto: CreateBatchDto): Promise<BatchResponse> {
    // 1. Guard — course must exist
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course');
    }

    // 2. Guard — batchNumber must be unique within the course
    const duplicate = await batchRepository.findByNumber(courseId, dto.batchNumber);
    if (duplicate) {
      throw new ConflictError(
        `Batch number ${dto.batchNumber} already exists for this course`,
      );
    }

    const batch = await batchRepository.createWithRelations(courseId, dto);

    logger.info('Batch created', {
      batchId: batch.id,
      courseId,
      batchNumber: dto.batchNumber,
    });

    return toBatchResponse(batch);
  }

  /**
   * List all batches for a course — paginated.
   */
  async getBatchesByCourse(
    courseId: string,
    query: BatchQueryDto,
  ): Promise<{ batches: BatchResponse[]; meta: PaginationMeta }> {
    // Guard — course must exist
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const result: FindAllBatchesResult = await batchRepository.findAllByCourse(courseId, {
      ...query,
      page,
      limit,
    });

    return {
      batches: result.data.map(toBatchResponse),
      meta: buildPaginationMeta(result.total, page, limit),
    };
  }

  /**
   * Get a single batch by its UUID.
   */
  async getBatchById(id: string): Promise<BatchResponse> {
    const batch = await batchRepository.findById(id);
    if (!batch) {
      throw new NotFoundError('Batch');
    }
    return toBatchResponse(batch);
  }

  /**
   * Update batch + optional trainer + optional batchLinks in a transaction.
   * Validates batchNumber uniqueness if batchNumber is not being changed
   * (note: batchNumber is intentionally NOT updatable to preserve integrity).
   */
  async updateBatch(id: string, dto: UpdateBatchDto): Promise<BatchResponse> {
    const existing = await batchRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Batch');
    }

    const updated = await batchRepository.updateWithRelations(id, dto);

    logger.info('Batch updated', { batchId: id });

    return toBatchResponse(updated);
  }

  /**
   * Delete a batch. Trainer and BatchLinks are removed by DB cascade.
   */
  async deleteBatch(id: string): Promise<void> {
    const batch = await batchRepository.findById(id);
    if (!batch) {
      throw new NotFoundError('Batch');
    }

    await batchRepository.delete(id);

    logger.info('Batch deleted', {
      batchId: id,
      courseId: batch.courseId,
      batchNumber: batch.batchNumber,
    });
  }
}

export const batchService = new BatchService();
