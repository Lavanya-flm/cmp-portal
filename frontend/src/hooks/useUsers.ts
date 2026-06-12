import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { QUERY_KEYS } from '../utils/constants';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  ChangeRoleRequest,
  ChangePasswordRequest,
  PaginationQuery,
} from '../types';

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useUsers(params?: PaginationQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.USERS(params),
    queryFn: () => userService.getUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_BY_ID(id),
    queryFn: () => userService.getUserById(id),
    enabled: Boolean(id),
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: userService.getMe,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEYS.USER_BY_ID(id), updated);
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useChangeRole(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChangeRoleRequest) => userService.changeRole(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEYS.USER_BY_ID(id), updated);
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateMe(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['users', 'me'], updated);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userService.changePassword(data),
  });
}
