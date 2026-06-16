import apiClient from '../api/axios';
import { API_ENDPOINTS } from '../utils/constants';
import type { ApiResponse, DashboardResponse } from '../types';

export const dashboardService = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const res = await apiClient.get<ApiResponse<DashboardResponse>>(
      API_ENDPOINTS.DASHBOARD,
    );
    return res.data.data;
  },
};
