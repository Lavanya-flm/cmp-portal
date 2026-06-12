import apiClient from '../api/axios';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  ApiResponse,
  PaginatedResponse,
  Batch,
  CreateBatchRequest,
  UpdateBatchRequest,
  PaginationQuery,
} from '../types';

export const batchService = {
  getBatchesByCourse: async (
    courseId: string,
    params?: PaginationQuery,
  ): Promise<PaginatedResponse<Batch>> => {
    const res = await apiClient.get<PaginatedResponse<Batch>>(
      API_ENDPOINTS.BATCHES_BY_COURSE(courseId),
      { params },
    );
    return res.data;
  },

  getBatchById: async (id: string): Promise<Batch> => {
    const res = await apiClient.get<ApiResponse<Batch>>(API_ENDPOINTS.BATCH_BY_ID(id));
    return res.data.data;
  },

  createBatch: async (courseId: string, data: CreateBatchRequest): Promise<Batch> => {
    const res = await apiClient.post<ApiResponse<Batch>>(
      API_ENDPOINTS.BATCHES_BY_COURSE(courseId),
      data,
    );
    return res.data.data;
  },

  updateBatch: async (id: string, data: UpdateBatchRequest): Promise<Batch> => {
    const res = await apiClient.put<ApiResponse<Batch>>(API_ENDPOINTS.BATCH_BY_ID(id), data);
    return res.data.data;
  },

  deleteBatch: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BATCH_BY_ID(id));
  },
};
