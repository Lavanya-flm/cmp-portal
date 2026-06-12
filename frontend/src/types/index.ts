// ─── Roles (mirrors backend exactly) ─────────────────────────────────────────

export type Role = 'SUPER_ADMIN' | 'SUB_ADMIN' | 'USER';

// ─── Shared API envelope shapes ───────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  code: string;
  requestId: string;
  errors?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface ChangeRoleRequest {
  role: Role;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Course ───────────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  name: string;
  description?: string;
}

export interface UpdateCourseRequest {
  name?: string;
  description?: string;
}

// ─── Batch ────────────────────────────────────────────────────────────────────

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  experience: number | null;
  currentCompany: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BatchLinks {
  id: string;
  syllabusLink: string | null;
  projectsLink: string | null;
  trainerDemoRecording: string | null;
  liveDemoRecording1: string | null;
  liveDemoRecording2: string | null;
  paymentLink: string | null;
  whatsappGroupLink: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  courseId: string;
  batchNumber: number;
  batchName: string;
  startDate: string;
  endDate: string | null;
  price: number;
  supportEmail: string;
  trainer: Trainer | null;
  batchLinks: BatchLinks | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainerRequest {
  name: string;
  email: string;
  phone?: string;
  experience?: number;
  currentCompany?: string;
}

export interface CreateBatchLinksRequest {
  syllabusLink?: string;
  projectsLink?: string;
  trainerDemoRecording?: string;
  liveDemoRecording1?: string;
  liveDemoRecording2?: string;
  paymentLink?: string;
  whatsappGroupLink?: string;
}

export interface CreateBatchRequest {
  batchNumber: number;
  batchName: string;
  startDate: string;
  endDate?: string;
  price: number;
  supportEmail: string;
  trainer: CreateTrainerRequest;
  batchLinks?: CreateBatchLinksRequest;
}

export interface UpdateBatchRequest {
  batchName?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  supportEmail?: string;
  trainer?: Partial<CreateTrainerRequest>;
  batchLinks?: CreateBatchLinksRequest;
}

// ─── Shared query params ──────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
