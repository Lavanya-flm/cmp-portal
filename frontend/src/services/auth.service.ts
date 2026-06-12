import apiClient from '../api/axios';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  AuthUser,
} from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH_LOGIN,
      data,
    );
    return res.data.data;
  },

  refresh: async (data: RefreshRequest): Promise<RefreshResponse> => {
    const res = await apiClient.post<ApiResponse<RefreshResponse>>(
      API_ENDPOINTS.AUTH_REFRESH,
      data,
    );
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
  },

  logoutAll: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT_ALL);
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await apiClient.get<ApiResponse<AuthUser>>(API_ENDPOINTS.AUTH_ME);
    return res.data.data;
  },
};
