import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { QUERY_KEYS, ROUTES, STORAGE_KEYS } from '../utils/constants';
import type { LoginRequest } from '../types';

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.AUTH_ME,
    queryFn: authService.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────

interface LoginWithRememberMe extends LoginRequest {
  rememberMe?: boolean;
}

export function useLogin() {
  const setAuth   = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  const navigate  = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: LoginWithRememberMe) =>
      authService.login({ email, password }),

    onSuccess: ({ accessToken, refreshToken, user }, variables) => {
      // Persist session based on "Remember me"
      if (variables.rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }

      setAuth(user, accessToken, refreshToken);
      queryClient.setQueryData(QUERY_KEYS.AUTH_ME, user);
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
  });
}

// ─── Register ─────────────────────────────────────────────────────────────────

export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });
}

// ─── Forgot password ──────────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
  });
}

// ─── Reset password ───────────────────────────────────────────────────────────

export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: () => {
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const navigate  = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      clearAuth();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });
}
