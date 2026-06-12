import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { GuestRoute } from '../components/auth/GuestRoute';
import { LoadingScreen } from '../components/auth/LoadingScreen';
import { ROUTES } from '../utils/constants';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
// Code-split per route so the login bundle stays tiny

const LoginPage     = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const CoursesPage      = lazy(() => import('../pages/CoursesPage').then((m) => ({ default: m.CoursesPage })));
const CourseDetailPage = lazy(() => import('../pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })));
const CreateCoursePage = lazy(() => import('../pages/CreateCoursePage').then((m) => ({ default: m.CreateCoursePage })));
const EditCoursePage   = lazy(() => import('../pages/EditCoursePage').then((m) => ({ default: m.EditCoursePage })));

// ─── Placeholder pages (replaced in upcoming phases) ─────────────────────────

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
        <svg className="h-7 w-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="max-w-xs text-sm text-gray-500">
        This page is coming in the next phase. Navigation and layout are fully working.
      </p>
    </div>
  );
}

// ─── 404 page ─────────────────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFF9F1] px-4">
      <p className="text-8xl font-extrabold text-amber-200">404</p>
      <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="text-sm text-gray-500">
        The page you are looking for does not exist.
      </p>
      <a
        href={ROUTES.DASHBOARD}
        className="mt-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
      >
        Go to Dashboard
      </a>
    </div>
  );
}

// ─── Route-level loading fallback ─────────────────────────────────────────────

function PageLoader() {
  return <LoadingScreen message="Loading page…" />;
}

// ─── AppLayout placeholder wrapper (used by coming-soon routes) ───────────────
// Avoids importing AppLayout directly for routes not yet built — keeps bundle lean.

const AppLayoutLazy = lazy(() =>
  import('../layouts/AppLayout').then((m) => ({ default: m.AppLayout })),
);

function WithAppLayout({ title }: { title: string }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AppLayoutLazy>
        <ComingSoon title={title} />
      </AppLayoutLazy>
    </Suspense>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

const router = createBrowserRouter([

  // ── Public: /login ────────────────────────────────────────────────────────
  {
    path: ROUTES.LOGIN,
    element: (
      <GuestRoute>
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </GuestRoute>
    ),
  },

  // ── Protected: Dashboard ──────────────────────────────────────────────────
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <DashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  // ── Protected: Courses ────────────────────────────────────────────────────
  {
    path: ROUTES.COURSES,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <CoursesPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  // ── Protected: Create Course ──────────────────────────────────────────────
  {
    path: ROUTES.COURSE_CREATE,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
        <Suspense fallback={<PageLoader />}>
          <CreateCoursePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  // ── Protected: Course detail ──────────────────────────────────────────────
  {
    path: ROUTES.COURSE_DETAIL,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <CourseDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  // ── Protected: Edit Course ────────────────────────────────────────────────
  {
    path: ROUTES.COURSE_EDIT,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
        <Suspense fallback={<PageLoader />}>
          <EditCoursePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  // ── Protected: Batches ────────────────────────────────────────────────────
  {
    path: '/batches',
    element: (
      <ProtectedRoute>
        <WithAppLayout title="Batches — Coming Soon" />
      </ProtectedRoute>
    ),
  },

  // ── Protected: Users (SUPER_ADMIN + SUB_ADMIN only) ───────────────────────
  {
    path: ROUTES.USERS,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
        <WithAppLayout title="User Management — Coming Soon" />
      </ProtectedRoute>
    ),
  },

  // ── Protected: Profile (all roles) ────────────────────────────────────────
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        <WithAppLayout title="My Profile — Coming Soon" />
      </ProtectedRoute>
    ),
  },

  // ── Protected: Change password ────────────────────────────────────────────
  {
    path: ROUTES.CHANGE_PASSWORD,
    element: (
      <ProtectedRoute>
        <WithAppLayout title="Change Password — Coming Soon" />
      </ProtectedRoute>
    ),
  },

  // ── 404 ───────────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
