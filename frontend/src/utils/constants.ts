// ─── Route paths ─────────────────────────────────────────────────────────────

export const ROUTES = {
  // Public
  LOGIN:           '/login',
  REGISTER:        '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD:  '/reset-password',

  // Dashboard
  DASHBOARD: '/',

  // Courses
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:id',
  COURSE_CREATE: '/courses/new',
  COURSE_EDIT: '/courses/:id/edit',

  // Batches
  BATCH_DETAIL: '/courses/:courseId/batches/:batchId',
  BATCH_CREATE: '/courses/:courseId/batches/new',
  BATCH_EDIT: '/courses/:courseId/batches/:batchId/edit',

  // Users
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  USER_CREATE: '/users/new',
  USER_EDIT:   '/users/:id/edit',

  // Profile
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/password',
} as const;

// Helper to build parameterised routes
export const buildRoute = {
  courseDetail: (id: string) => `/courses/${id}`,
  courseEdit:   (id: string) => `/courses/${id}/edit`,
  batchDetail:  (courseId: string, batchId: string) => `/courses/${courseId}/batches/${batchId}`,
  batchCreate:  (courseId: string) => `/courses/${courseId}/batches/new`,
  batchEdit:    (courseId: string, batchId: string) => `/courses/${courseId}/batches/${batchId}/edit`,
  userDetail:   (id: string) => `/users/${id}`,
  userEdit:     (id: string) => `/users/${id}/edit`,
};

// ─── API endpoint paths (relative to VITE_API_BASE_URL) ──────────────────────

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN:            '/auth/login',
  AUTH_REGISTER:         '/auth/register',
  AUTH_FORGOT_PASSWORD:  '/auth/forgot-password',
  AUTH_RESET_PASSWORD:   '/auth/reset-password',
  AUTH_REFRESH:          '/auth/refresh',
  AUTH_LOGOUT:           '/auth/logout',
  AUTH_LOGOUT_ALL:       '/auth/logout-all',
  AUTH_ME:               '/auth/me',

  // Users
  USERS:            '/users',
  USER_BY_ID:       (id: string) => `/users/${id}`,
  USER_ROLE:        (id: string) => `/users/${id}/role`,
  USERS_ME:         '/users/me',
  USERS_ME_PASSWORD:'/users/me/password',

  // Courses
  COURSES:          '/courses',
  COURSE_BY_ID:     (id: string) => `/courses/${id}`,

  // Batches
  BATCHES_BY_COURSE:(courseId: string) => `/courses/${courseId}/batches`,
  BATCH_BY_ID:      (id: string) => `/batches/${id}`,

  // Dashboard
  DASHBOARD: '/dashboard',

  // Batch Resources
  BATCH_RESOURCES:    (batchId: string) => `/batches/${batchId}/resources`,
  BATCH_RESOURCE_BY_ID: (batchId: string, resourceId: string) => `/batches/${batchId}/resources/${resourceId}`,
} as const;

// ─── Token storage keys ───────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'cmp_access_token',
  REFRESH_TOKEN: 'cmp_refresh_token',
  USER:          'cmp_user',
  REMEMBER_ME:   'cmp_remember_me',
} as const;

// ─── React Query cache keys ───────────────────────────────────────────────────

export const QUERY_KEYS = {
  // Auth
  AUTH_ME: ['auth', 'me'] as const,

  // Users
  USERS:      (params?: object) => ['users', params] as const,
  USER_BY_ID: (id: string)      => ['users', id] as const,

  // Courses
  COURSES:      (params?: object) => ['courses', params] as const,
  COURSE_BY_ID: (id: string)      => ['courses', id] as const,

  // Batches
  BATCHES:      (courseId: string, params?: object) => ['batches', courseId, params] as const,
  BATCH_BY_ID:  (id: string)                        => ['batches', id] as const,

  // Dashboard
  DASHBOARD: ['dashboard'] as const,

  // Batch Resources
  BATCH_RESOURCES: (batchId: string) => ['batch-resources', batchId] as const,
} as const;
