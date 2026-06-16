import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { GuestRoute }     from '../components/auth/GuestRoute';
import { LoadingScreen }  from '../components/auth/LoadingScreen';
import { ROUTES }         from '../utils/constants';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────

// Auth
const LoginPage          = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage       = lazy(() => import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage  = lazy(() => import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));

// Dashboard
const DashboardPage      = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));

// Courses
const CoursesPage        = lazy(() => import('../pages/CoursesPage').then((m) => ({ default: m.CoursesPage })));
const CourseDetailPage   = lazy(() => import('../pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })));
const CreateCoursePage   = lazy(() => import('../pages/CreateCoursePage').then((m) => ({ default: m.CreateCoursePage })));
const EditCoursePage     = lazy(() => import('../pages/EditCoursePage').then((m) => ({ default: m.EditCoursePage })));

// Batches
const BatchDetailPage    = lazy(() => import('../pages/BatchDetailPage').then((m) => ({ default: m.BatchDetailPage })));
const CreateBatchPage    = lazy(() => import('../pages/CreateBatchPage').then((m) => ({ default: m.CreateBatchPage })));
const EditBatchPage      = lazy(() => import('../pages/EditBatchPage').then((m) => ({ default: m.EditBatchPage })));

// Users
const UsersPage          = lazy(() => import('../pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const UserDetailPage     = lazy(() => import('../pages/UserDetailPage').then((m) => ({ default: m.UserDetailPage })));
const CreateUserPage     = lazy(() => import('../pages/CreateUserPage').then((m) => ({ default: m.CreateUserPage })));
const EditUserPage       = lazy(() => import('../pages/EditUserPage').then((m) => ({ default: m.EditUserPage })));

// ─── 404 ─────────────────────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="mt-2 text-gray-500">Page not found</p>
      </div>
    </div>
  );
}

// ─── Fallback wrapper ─────────────────────────────────────────────────────────

function Page({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

// ─── Router ───────────────────────────────────────────────────────────────────

const router = createBrowserRouter([

  // ── Auth — public only (redirect to dashboard when logged in) ────────────
  {
    path: ROUTES.LOGIN,
    element: <GuestRoute><Page><LoginPage /></Page></GuestRoute>,
  },
  {
    path: ROUTES.REGISTER,
    element: <GuestRoute><Page><RegisterPage /></Page></GuestRoute>,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <GuestRoute><Page><ForgotPasswordPage /></Page></GuestRoute>,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <GuestRoute><Page><ResetPasswordPage /></Page></GuestRoute>,
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    path: ROUTES.DASHBOARD,
    element: <ProtectedRoute><Page><DashboardPage /></Page></ProtectedRoute>,
  },

  // ── Courses ───────────────────────────────────────────────────────────────
  {
    path: ROUTES.COURSES,
    element: <ProtectedRoute><Page><CoursesPage /></Page></ProtectedRoute>,
  },
  {
    path: ROUTES.COURSE_CREATE,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
        <Page><CreateCoursePage /></Page>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.COURSE_DETAIL,
    element: <ProtectedRoute><Page><CourseDetailPage /></Page></ProtectedRoute>,
  },
  {
    path: ROUTES.COURSE_EDIT,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
        <Page><EditCoursePage /></Page>
      </ProtectedRoute>
    ),
  },

  // ── Batches ───────────────────────────────────────────────────────────────
  {
    path: ROUTES.BATCH_CREATE,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
        <Page><CreateBatchPage /></Page>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.BATCH_DETAIL,
    element: <ProtectedRoute><Page><BatchDetailPage /></Page></ProtectedRoute>,
  },
  {
    path: ROUTES.BATCH_EDIT,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
        <Page><EditBatchPage /></Page>
      </ProtectedRoute>
    ),
  },

  // ── Users — admin only ────────────────────────────────────────────────────
  {
    path: ROUTES.USERS,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
        <Page><UsersPage /></Page>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USER_CREATE,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
        <Page><CreateUserPage /></Page>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USER_DETAIL,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
        <Page><UserDetailPage /></Page>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USER_EDIT,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
        <Page><EditUserPage /></Page>
      </ProtectedRoute>
    ),
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  {
    path: ROUTES.PROFILE,
    element: <ProtectedRoute><Page><UserDetailPage /></Page></ProtectedRoute>,
  },

  // ── 404 ───────────────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
