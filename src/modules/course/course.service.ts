import { courseRepository } from './course.repository';
import { NotFoundError, ConflictError } from '../../core/errors/AppError';
import { logger } from '../../core/logger';
import { buildPaginationMeta } from '../../core/utils/response.util';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  CourseEntity,
  CourseResponse,
  FindAllCoursesResult,
} from './course.types';
import { PaginationMeta } from '../../core/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toResponse(course: CourseEntity): CourseResponse {
  return {
    id: course.id,
    name: course.name,
    description: course.description,
    status: course.status ?? null,
    bannerImage: course.bannerImage ?? null,
    courseOffers: course.courseOffers ?? null,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class CourseService {
  /**
   * Create a new course.
   * Rejects if a course with the same name already exists (case-insensitive).
   */
  async createCourse(dto: CreateCourseDto): Promise<CourseResponse> {
    const existing = await courseRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictError(`A course named "${dto.name}" already exists`);
    }

    const course = await courseRepository.create(dto);
    logger.info('Course created', { courseId: course.id, name: course.name });

    return toResponse(course);
  }

  /**
   * Retrieve paginated list of courses with optional name search.
   */
  async getCourses(query: CourseQueryDto): Promise<{
    courses: CourseResponse[];
    meta: PaginationMeta;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const result: FindAllCoursesResult = await courseRepository.findAll({ ...query, page, limit });

    return {
      courses: result.data.map(toResponse),
      meta: buildPaginationMeta(result.total, page, limit),
    };
  }

  /**
   * Get a single course by ID.
   * Throws NotFoundError when the course does not exist.
   */
  async getCourseById(id: string): Promise<CourseResponse> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course');
    }
    return toResponse(course);
  }

  /**
   * Update a course.
   * Throws NotFoundError if missing; ConflictError on duplicate name.
   */
  async updateCourse(id: string, dto: UpdateCourseDto): Promise<CourseResponse> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course');
    }

    // Duplicate name check — skip if name isn't being changed
    if (dto.name && dto.name.toLowerCase() !== course.name.toLowerCase()) {
      const duplicate = await courseRepository.findByName(dto.name, id);
      if (duplicate) {
        throw new ConflictError(`A course named "${dto.name}" already exists`);
      }
    }

    const updated = await courseRepository.update(id, dto);
    logger.info('Course updated', { courseId: id });

    return toResponse(updated);
  }

  /**
   * Delete a course and all its dependent records (cascade).
   */
  async deleteCourse(id: string): Promise<void> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course');
    }

    await courseRepository.delete(id);
    logger.info('Course deleted', { courseId: id, name: course.name });
  }
}

// Singleton instance
export const courseService = new CourseService();
