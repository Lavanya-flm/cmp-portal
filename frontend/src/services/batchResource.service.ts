import apiClient from '../api/axios';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  ApiResponse,
  BatchResource,
  CreateBatchResourceRequest,
} from '../types';

export const batchResourceService = {
  getAll: async (batchId: string): Promise<BatchResource[]> => {
    const res = await apiClient.get<ApiResponse<BatchResource[]>>(
      API_ENDPOINTS.BATCH_RESOURCES(batchId),
    );
    return res.data.data;
  },

  create: async (batchId: string, data: CreateBatchResourceRequest): Promise<BatchResource> => {
    const res = await apiClient.post<ApiResponse<BatchResource>>(
      API_ENDPOINTS.BATCH_RESOURCES(batchId),
      data,
    );
    return res.data.data;
  },

  delete: async (batchId: string, resourceId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BATCH_RESOURCE_BY_ID(batchId, resourceId));
  },
};
