import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../services/course.service';
import { QUERY_KEYS } from '../utils/constants';
import type {
  CreateCourseRequest,
  UpdateCourseRequest,
  PaginationQuery,
} from '../types';

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useCourses(params?: PaginationQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES(params),
    queryFn: () => courseService.getCourses(params),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COURSE_BY_ID(id),
    queryFn: () => courseService.getCourseById(id),
    enabled: Boolean(id),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseRequest) => courseService.createCourse(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCourseRequest) => courseService.updateCourse(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEYS.COURSE_BY_ID(id), updated);
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
