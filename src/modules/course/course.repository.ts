import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  CourseEntity,
  FindAllCoursesResult,
} from './course.types';

export class CourseRepository {
  /**
   * Create a new course record.
   */
  async create(dto: CreateCourseDto): Promise<CourseEntity> {
    return prisma.course.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
      },
    });
  }

  /**
   * Find all courses with optional search, pagination, and sorting.
   */
  async findAll(query: CourseQueryDto): Promise<FindAllCoursesResult> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: Prisma.CourseWhereInput = search
      ? {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    const orderBy: Prisma.CourseOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Find a single course by its UUID.
   * Returns null when not found — caller decides whether to throw.
   */
  async findById(id: string): Promise<CourseEntity | null> {
    return prisma.course.findUnique({ where: { id } });
  }

  /**
   * Find a course by exact name (case-insensitive).
   * Used for duplicate name check on create/update.
   */
  async findByName(name: string, excludeId?: string): Promise<CourseEntity | null> {
    return prisma.course.findFirst({
      where: {
        name: { equals: name, mode: Prisma.QueryMode.insensitive },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  /**
   * Update a course by UUID.
   */
  async update(id: string, dto: UpdateCourseDto): Promise<CourseEntity> {
    return prisma.course.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  /**
   * Hard-delete a course by UUID.
   * Cascade in the schema will remove related batches.
   */
  async delete(id: string): Promise<CourseEntity> {
    return prisma.course.delete({ where: { id } });
  }
}

// Export a singleton instance — avoids creating a new object per request
export const courseRepository = new CourseRepository();
