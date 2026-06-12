import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { QUERY_KEYS, ROUTES } from '../utils/constants';
import type { LoginRequest } from '../types';

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch the currently authenticated user from /auth/me.
 * Only runs when the user is already marked as authenticated.
 */
export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.AUTH_ME,
    queryFn: authService.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: ({ accessToken, refreshToken, user }) => {
      setAuth(user, accessToken, refreshToken);
      queryClient.setQueryData(QUERY_KEYS.AUTH_ME, user);
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });
}
