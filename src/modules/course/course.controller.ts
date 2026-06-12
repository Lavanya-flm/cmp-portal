import { Request, Response, NextFunction } from 'express';
import { courseService } from './course.service';
import { sendSuccess, sendPaginated } from '../../core/utils/response.util';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from './course.types';

export class CourseController {
  /**
   * POST /courses
   * Create a new course.
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateCourseDto;
      const course = await courseService.createCourse(dto);
      sendSuccess(res, course, 'Course created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses
   * List all courses — paginated, with optional name search.
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as CourseQueryDto;
      const { courses, meta } = await courseService.getCourses(query);
      sendPaginated(res, courses, meta, 'Courses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /courses/:id
   * Get a single course by UUID.
   */
  async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const course = await courseService.getCourseById(id);
      sendSuccess(res, course, 'Course retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /courses/:id
   * Update a course.
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateCourseDto;
      const course = await courseService.updateCourse(id, dto);
      sendSuccess(res, course, 'Course updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /courses/:id
   * Delete a course and cascade to all its batches.
   */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await courseService.deleteCourse(id);
      sendSuccess(res, null, 'Course deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

// Singleton — bind methods so `this` is preserved when Express calls them
const controller = new CourseController();
export const courseController = {
  create: controller.create.bind(controller),
  findAll: controller.findAll.bind(controller),
  findOne: controller.findOne.bind(controller),
  update: controller.update.bind(controller),
  remove: controller.remove.bind(controller),
};
