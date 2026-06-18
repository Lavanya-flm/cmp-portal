import { Course } from '@prisma/client';

export type CourseEntity = Course;

export interface CreateCourseDto {
  name: string;
  description?: string;
  status?: string;
  bannerImage?: string | null;
  whatYouWillLearn?: string | null;
}

export interface UpdateCourseDto {
  name?: string;
  description?: string;
  status?: string;
  bannerImage?: string | null;
  whatYouWillLearn?: string | null;
}

export interface CourseQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CourseResponse {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  bannerImage: string | null;
  whatYouWillLearn: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FindAllCoursesResult {
  data: CourseEntity[];
  total: number;
}
