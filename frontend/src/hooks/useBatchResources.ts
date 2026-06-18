import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchResourceService } from '../services/batchResource.service';
import { QUERY_KEYS } from '../utils/constants';
import type { CreateBatchResourceRequest } from '../types';

export function useBatchResources(batchId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BATCH_RESOURCES(batchId),
    queryFn:  () => batchResourceService.getAll(batchId),
    enabled:  Boolean(batchId),
    staleTime: 30 * 1000,
  });
}

export function useCreateBatchResource(batchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBatchResourceRequest) =>
      batchResourceService.create(batchId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BATCH_RESOURCES(batchId) });
    },
  });
}

export function useDeleteBatchResource(batchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: string) =>
      batchResourceService.delete(batchId, resourceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BATCH_RESOURCES(batchId) });
    },
  });
}
