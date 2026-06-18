import { batchResourceRepository } from './batchResource.repository';
import { NotFoundError } from '../../core/errors/AppError';
import { logger } from '../../core/logger';
import { prisma } from '../../config/database';
import {
  BatchResourceEntity,
  BatchResourceResponse,
  CreateBatchResourceDto,
  RESOURCE_TYPE_LABELS,
} from './batchResource.types';
import { ResourceType } from '@prisma/client';

function toResponse(r: BatchResourceEntity): BatchResourceResponse {
  return {
    id:                r.id,
    batchId:           r.batchId,
    resourceType:      r.resourceType,
    resourceTypeLabel: RESOURCE_TYPE_LABELS[r.resourceType as ResourceType],
    title:             r.title,
    description:       r.description,
    fileName:          r.fileName,
    fileUrl:           r.fileUrl,
    fileSize:          r.fileSize,
    mimeType:          r.mimeType,
    createdAt:         r.createdAt,
    updatedAt:         r.updatedAt,
  };
}

export class BatchResourceService {
  async create(batchId: string, dto: CreateBatchResourceDto): Promise<BatchResourceResponse> {
    // Guard — batch must exist
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundError('Batch');

    const resource = await batchResourceRepository.create(batchId, dto);
    logger.info('BatchResource created', { resourceId: resource.id, batchId });
    return toResponse(resource);
  }

  async getAllByBatch(batchId: string): Promise<BatchResourceResponse[]> {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundError('Batch');
    const resources = await batchResourceRepository.findAllByBatch(batchId);
    return resources.map(toResponse);
  }

  async getById(batchId: string, resourceId: string): Promise<BatchResourceResponse> {
    const resource = await batchResourceRepository.findById(resourceId, batchId);
    if (!resource) throw new NotFoundError('BatchResource');
    return toResponse(resource);
  }

  async delete(batchId: string, resourceId: string): Promise<void> {
    const resource = await batchResourceRepository.findById(resourceId, batchId);
    if (!resource) throw new NotFoundError('BatchResource');
    await batchResourceRepository.delete(resourceId);
    logger.info('BatchResource deleted', { resourceId, batchId });
  }
}

export const batchResourceService = new BatchResourceService();
