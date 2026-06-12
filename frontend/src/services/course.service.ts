import apiClient from '../api/axios';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  ApiResponse,
  PaginatedResponse,
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  PaginationQuery,
} from '../types';

export const courseService = {
  getCourses: async (params?: PaginationQuery): Promise<PaginatedResponse<Course>> => {
    const res = await apiClient.get<PaginatedResponse<Course>>(API_ENDPOINTS.COURSES, { params });
    return res.data;
  },

  getCourseById: async (id: string): Promise<Course> => {
    const res = await apiClient.get<ApiResponse<Course>>(API_ENDPOINTS.COURSE_BY_ID(id));
    return res.data.data;
  },

  createCourse: async (data: CreateCourseRequest): Promise<Course> => {
    const res = await apiClient.post<ApiResponse<Course>>(API_ENDPOINTS.COURSES, data);
    return res.data.data;
  },

  updateCourse: async (id: string, data: UpdateCourseRequest): Promise<Course> => {
    const res = await apiClient.put<ApiResponse<Course>>(API_ENDPOINTS.COURSE_BY_ID(id), data);
    return res.data.data;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.COURSE_BY_ID(id));
  },
};
