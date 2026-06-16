import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { useAuthStore } from '../store/auth.store';

// ─── Pages ────────────────────────────────────────────────────────────────────
import { DashboardPage }    from '../pages/DashboardPage';
import { LoginPage }        from '../pages/LoginPage';
import { CoursesPage }      from '../pages/CoursesPage';
import { CourseDetailPage } from '../pages/CourseDetailPage';
import { CreateCoursePage } from '../pages/CreateCoursePage';
import { EditCoursePage }   from '../pages/EditCoursePage';
import { BatchDetailPage }  from '../pages/BatchDetailPage';
import { CreateBatchPage }  from '../pages/CreateBatchPage';
import { EditBatchPage }    from '../pages/EditBatchPage';
import { UsersPage }        from '../pages/UsersPage';
import { UserDetailPage }   from '../pages/UserDetailPage';
import { CreateUserPage }   from '../pages/CreateUserPage';

// ─── 404 ─────────────────────────────────────────────────────────────────────
const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-2 text-gray-500">Page not found</p>
    </div>
  </div>
);

// ─── Auth guards ─────────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <>{children}</>;
}

// ─── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([

  // ── Auth (public, redirect if already logged in) ──────────────────────────
  {
    path: ROUTES.LOGIN,
    element: <RequireGuest><LoginPage /></RequireGuest>,
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    path: ROUTES.DASHBOARD,
    element: <RequireAuth><DashboardPage /></RequireAuth>,
  },

  // ── Courses ───────────────────────────────────────────────────────────────
  {
    path: ROUTES.COURSES,
    element: <RequireAuth><CoursesPage /></RequireAuth>,
  },
  {
    path: ROUTES.COURSE_CREATE,
    element: <RequireAuth><CreateCoursePage /></RequireAuth>,
  },
  {
    path: ROUTES.COURSE_DETAIL,
    element: <RequireAuth><CourseDetailPage /></RequireAuth>,
  },
  {
    path: ROUTES.COURSE_EDIT,
    element: <RequireAuth><EditCoursePage /></RequireAuth>,
  },

  // ── Batches ───────────────────────────────────────────────────────────────
  {
    path: ROUTES.BATCH_CREATE,
    element: <RequireAuth><CreateBatchPage /></RequireAuth>,
  },
  {
    path: ROUTES.BATCH_DETAIL,
    element: <RequireAuth><BatchDetailPage /></RequireAuth>,
  },
  {
    path: ROUTES.BATCH_EDIT,
    element: <RequireAuth><EditBatchPage /></RequireAuth>,
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  {
    path: ROUTES.USERS,
    element: <RequireAuth><UsersPage /></RequireAuth>,
  },
  {
    path: ROUTES.USER_CREATE,
    element: <RequireAuth><CreateUserPage /></RequireAuth>,
  },
  {
    path: ROUTES.USER_DETAIL,
    element: <RequireAuth><UserDetailPage /></RequireAuth>,
  },

  // ── 404 ───────────────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
