import { ResourceType } from '@prisma/client';
import { prisma } from '../../config/database';
import { BatchResourceEntity, CreateBatchResourceDto } from './batchResource.types';

export class BatchResourceRepository {
  async create(batchId: string, dto: CreateBatchResourceDto): Promise<BatchResourceEntity> {
    return prisma.batchResource.create({
      data: {
        batchId,
        resourceType: dto.resourceType as ResourceType,
        title:        dto.title,
        description:  dto.description ?? null,
        fileName:     dto.fileName,
        fileUrl:      dto.fileUrl,
        fileSize:     dto.fileSize ?? null,
        mimeType:     dto.mimeType ?? null,
      },
    });
  }

  async findAllByBatch(batchId: string): Promise<BatchResourceEntity[]> {
    return prisma.batchResource.findMany({
      where:   { batchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, batchId: string): Promise<BatchResourceEntity | null> {
    return prisma.batchResource.findFirst({ where: { id, batchId } });
  }

  async delete(id: string): Promise<void> {
    await prisma.batchResource.delete({ where: { id } });
  }
}

export const batchResourceRepository = new BatchResourceRepository();
