import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  CreateBatchDto,
  UpdateBatchDto,
  BatchQueryDto,
  BatchWithRelations,
  FindAllBatchesResult,
} from './batch.types';

// ─── Include clause (reused in every query that returns relations) ────────────

const WITH_RELATIONS = {
  trainer: true,
  batchLinks: true,
} as const;

export class BatchRepository {
  /**
   * Create Batch + Trainer + BatchLinks atomically inside a single transaction.
   * If any step fails the entire transaction is rolled back by Prisma.
   */
  async createWithRelations(
    courseId: string,
    dto: CreateBatchDto,
  ): Promise<BatchWithRelations> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the batch
      const batch = await tx.batch.create({
        data: {
          courseId,
          batchNumber:    dto.batchNumber,
          batchMonthYear: dto.batchMonthYear ?? null,
          batchName:      dto.batchName,
          status:         dto.status         ?? 'Upcoming',
          startDate:      new Date(dto.startDate),
          endDate:        dto.endDate ? new Date(dto.endDate) : null,
          price:          new Prisma.Decimal(dto.price),
          supportEmail:   dto.supportEmail,
        },
      });

      // 2. Create the trainer (mandatory)
      await tx.trainer.create({
        data: {
          batchId: batch.id,
          name: dto.trainer.name,
          email: dto.trainer.email,
          phone: dto.trainer.phone ?? null,
          experience: dto.trainer.experience ?? null,
          currentCompany: dto.trainer.currentCompany ?? null,
        },
      });

      // 3. Create batch links
      await tx.batchLinks.create({
        data: {
          batchId:              batch.id,
          syllabusLink:         dto.batchLinks?.syllabusLink         ?? null,
          projectsLink:         dto.batchLinks?.projectsLink         ?? null,
          trainerDemoRecording: dto.batchLinks?.trainerDemoRecording ?? null,
          liveDemoRecording1:   dto.batchLinks?.liveDemoRecording1   ?? null,
          liveDemoRecording2:   dto.batchLinks?.liveDemoRecording2   ?? null,
          paymentLink:          dto.batchLinks?.paymentLink          ?? null,
          whatsappGroupLink:    dto.batchLinks?.whatsappGroupLink    ?? null,
          communityLink:        dto.batchLinks?.communityLink        ?? null,
        },
      });

      // 4. Return the full record with relations
      return tx.batch.findUniqueOrThrow({
        where: { id: batch.id },
        include: WITH_RELATIONS,
      });
    });
  }

  /**
   * List all batches for a course — paginated and sorted.
   */
  async findAllByCourse(
    courseId: string,
    query: BatchQueryDto,
  ): Promise<FindAllBatchesResult> {
    const { page = 1, limit = 10, sortBy = 'batchNumber', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BatchWhereInput = { courseId };

    const [data, total] = await prisma.$transaction([
      prisma.batch.findMany({
        where,
        include: WITH_RELATIONS,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.batch.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Find a single batch by its UUID — includes trainer and links.
   */
  async findById(id: string): Promise<BatchWithRelations | null> {
    return prisma.batch.findUnique({
      where: { id },
      include: WITH_RELATIONS,
    });
  }

  /**
   * Check for a duplicate batchNumber within the same course,
   * optionally excluding the current record (used on update).
   */
  async findByNumber(
    courseId: string,
    batchNumber: number,
    excludeId?: string,
  ): Promise<BatchWithRelations | null> {
    return prisma.batch.findFirst({
      where: {
        courseId,
        batchNumber,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      include: WITH_RELATIONS,
    });
  }

  /**
   * Update batch core fields + optionally update trainer and batchLinks.
   * All three updates run inside a single transaction.
   */
  async updateWithRelations(
    id: string,
    dto: UpdateBatchDto,
  ): Promise<BatchWithRelations> {
    return prisma.$transaction(async (tx) => {
      // 1. Update batch core fields (only what was supplied)
      await tx.batch.update({
        where: { id },
        data: {
          ...(dto.batchName      !== undefined && { batchName:      dto.batchName }),
          ...(dto.batchMonthYear !== undefined && { batchMonthYear: dto.batchMonthYear }),
          ...(dto.status         !== undefined && { status:         dto.status }),
          ...(dto.startDate      !== undefined && { startDate:      new Date(dto.startDate) }),
          ...(dto.endDate        !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
          ...(dto.price          !== undefined && { price:          new Prisma.Decimal(dto.price) }),
          ...(dto.supportEmail   !== undefined && { supportEmail:   dto.supportEmail }),
        },
      });

      // 2. Update trainer if supplied
      if (dto.trainer) {
        await tx.trainer.update({
          where: { batchId: id },
          data: {
            ...(dto.trainer.name !== undefined && { name: dto.trainer.name }),
            ...(dto.trainer.email !== undefined && { email: dto.trainer.email }),
            ...(dto.trainer.phone !== undefined && { phone: dto.trainer.phone }),
            ...(dto.trainer.experience !== undefined && { experience: dto.trainer.experience }),
            ...(dto.trainer.currentCompany !== undefined && {
              currentCompany: dto.trainer.currentCompany,
            }),
          },
        });
      }

      // 3. Update batchLinks if supplied
      if (dto.batchLinks) {
        await tx.batchLinks.update({
          where: { batchId: id },
          data: {
            ...(dto.batchLinks.syllabusLink         !== undefined && { syllabusLink:         dto.batchLinks.syllabusLink }),
            ...(dto.batchLinks.projectsLink         !== undefined && { projectsLink:         dto.batchLinks.projectsLink }),
            ...(dto.batchLinks.trainerDemoRecording !== undefined && { trainerDemoRecording: dto.batchLinks.trainerDemoRecording }),
            ...(dto.batchLinks.liveDemoRecording1   !== undefined && { liveDemoRecording1:   dto.batchLinks.liveDemoRecording1 }),
            ...(dto.batchLinks.liveDemoRecording2   !== undefined && { liveDemoRecording2:   dto.batchLinks.liveDemoRecording2 }),
            ...(dto.batchLinks.paymentLink          !== undefined && { paymentLink:          dto.batchLinks.paymentLink }),
            ...(dto.batchLinks.whatsappGroupLink    !== undefined && { whatsappGroupLink:    dto.batchLinks.whatsappGroupLink }),
            ...(dto.batchLinks.communityLink        !== undefined && { communityLink:        dto.batchLinks.communityLink }),
          },
        });
      }

      // 4. Return updated record with fresh relations
      return tx.batch.findUniqueOrThrow({
        where: { id },
        include: WITH_RELATIONS,
      });
    });
  }

  /**
   * Delete a batch — trainer and batchLinks are removed by DB cascade.
   */
  async delete(id: string): Promise<void> {
    await prisma.batch.delete({ where: { id } });
  }
}

export const batchRepository = new BatchRepository();
