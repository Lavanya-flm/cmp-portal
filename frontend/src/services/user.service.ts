import apiClient from '../api/axios';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeRoleRequest,
  ChangePasswordRequest,
  PaginationQuery,
} from '../types';

export const userService = {
  getUsers: async (params?: PaginationQuery): Promise<PaginatedResponse<User>> => {
    const res = await apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS, { params });
    return res.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USER_BY_ID(id));
    return res.data.data;
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const res = await apiClient.post<ApiResponse<User>>(API_ENDPOINTS.USERS, data);
    return res.data.data;
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>(API_ENDPOINTS.USER_BY_ID(id), data);
    return res.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USER_BY_ID(id));
  },

  changeRole: async (id: string, data: ChangeRoleRequest): Promise<User> => {
    const res = await apiClient.patch<ApiResponse<User>>(API_ENDPOINTS.USER_ROLE(id), data);
    return res.data.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS_ME);
    return res.data.data;
  },

  updateMe: async (data: UpdateUserRequest): Promise<User> => {
    const res = await apiClient.patch<ApiResponse<User>>(API_ENDPOINTS.USERS_ME, data);
    return res.data.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.USERS_ME_PASSWORD, data);
  },
};
