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
  bannerImage?: string | null;
  status?: string;
  /** Multi-line text listing what students will learn */
  whatYouWillLearn?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  name: string;
  description?: string;
  status?: string;
  bannerImage?: string | null;
  whatYouWillLearn?: string;
}

export interface UpdateCourseRequest {
  name?: string;
  description?: string;
  status?: string;
  bannerImage?: string | null;
  whatYouWillLearn?: string;
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
  communityLink: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  courseId: string;
  batchNumber: number;
  batchMonthYear: string | null;
  batchName: string;
  /** Derived from dates — never stored */
  status: string;
  startDate: string;
  endDate: string | null;
  price: number;
  supportEmail: string;
  duration: string | null;
  extraOffers: string | null;
  feedback1: number | null;
  feedback2: number | null;
  feedback3: number | null;
  overallFeedback: number | null;
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
  communityLink?: string;
}

export interface CreateBatchRequest {
  batchMonthYear?: string;
  batchName: string;
  startDate: string;
  endDate?: string;
  price: number;
  supportEmail: string;
  duration?: string;
  extraOffers?: string;
  feedback1?: number;
  feedback2?: number;
  feedback3?: number;
  overallFeedback?: number;
  trainer: CreateTrainerRequest;
  batchLinks?: CreateBatchLinksRequest;
}

export interface UpdateBatchRequest {
  batchName?: string;
  batchMonthYear?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  supportEmail?: string;
  duration?: string;
  extraOffers?: string;
  feedback1?: number;
  feedback2?: number;
  feedback3?: number;
  overallFeedback?: number;
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

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalCourses: number;
  totalBatches: number;
  liveBatches: number;
  upcomingBatches: number;
  completedBatches: number;
  totalUsers: number;
}

export interface DashboardRecentCourse {
  id: string;
  name: string;
  totalBatches: number;
  createdAt: string;
}

export interface DashboardRecentBatch {
  id: string;
  batchName: string;
  batchMonthYear: string | null;
  status: string;
  courseName: string;
}

export interface DashboardResponse {
  role: string;
  summary: DashboardSummary | null;
  recentCourses: DashboardRecentCourse[];
  recentBatches: DashboardRecentBatch[];
}

// ─── Batch Resources ──────────────────────────────────────────────────────────

export const RESOURCE_TYPES = [
  'SYLLABUS',
  'PROJECT_DOCUMENT',
  'ASSIGNMENT',
  'INTERVIEW_QUESTION',
  'PPT',
  'NOTE',
  'CHEAT_SHEET',
  'PLACEMENT_MATERIAL',
] as const;

export type ResourceType = typeof RESOURCE_TYPES[number];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  SYLLABUS:           'Syllabus',
  PROJECT_DOCUMENT:   'Project Documents',
  ASSIGNMENT:         'Assignments',
  INTERVIEW_QUESTION: 'Interview Questions',
  PPT:                'PPTs',
  NOTE:               'Notes',
  CHEAT_SHEET:        'Cheat Sheets',
  PLACEMENT_MATERIAL: 'Placement Materials',
};

export interface BatchResource {
  id: string;
  batchId: string;
  resourceType: ResourceType;
  resourceTypeLabel: string;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBatchResourceRequest {
  resourceType: ResourceType;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}
