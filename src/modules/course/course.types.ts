import { Course } from '@prisma/client';

// ─── Entity ───────────────────────────────────────────────────────────────────

export type CourseEntity = Course;

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateCourseDto {
  name: string;
  description?: string;
}

export interface UpdateCourseDto {
  name?: string;
  description?: string;
}

export interface CourseQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface CourseResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Repository interface ─────────────────────────────────────────────────────

export interface FindAllCoursesResult {
  data: CourseEntity[];
  total: number;
}
