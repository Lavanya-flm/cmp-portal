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

// ─── Extra request/response types for new auth flows ─────────────────────────

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: AuthUser;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ─── Auth service ─────────────────────────────────────────────────────────────

export const authService = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await apiClient.post<ApiResponse<RegisterResponse>>(
      API_ENDPOINTS.AUTH_REGISTER,
      data,
    );
    return res.data.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH_LOGIN,
      data,
    );
    return res.data.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const res = await apiClient.post<ApiResponse<ForgotPasswordResponse>>(
      API_ENDPOINTS.AUTH_FORGOT_PASSWORD,
      data,
    );
    return res.data.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, data);
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
