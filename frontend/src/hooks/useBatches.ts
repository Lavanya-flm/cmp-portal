import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchService } from '../services/batch.service';
import { QUERY_KEYS } from '../utils/constants';
import type {
  CreateBatchRequest,
  UpdateBatchRequest,
  PaginationQuery,
} from '../types';

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useBatches(courseId: string, params?: PaginationQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.BATCHES(courseId, params),
    queryFn: () => batchService.getBatchesByCourse(courseId, params),
    enabled: Boolean(courseId),
  });
}

export function useBatch(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BATCH_BY_ID(id),
    queryFn: () => batchService.getBatchById(id),
    enabled: Boolean(id),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateBatch(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBatchRequest) => batchService.createBatch(courseId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['batches', courseId] });
    },
  });
}

export function useUpdateBatch(id: string, courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBatchRequest) => batchService.updateBatch(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEYS.BATCH_BY_ID(id), updated);
      void queryClient.invalidateQueries({ queryKey: ['batches', courseId] });
    },
  });
}

export function useDeleteBatch(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => batchService.deleteBatch(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['batches', courseId] });
    },
  });
}
