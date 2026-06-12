import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { useAuthStore } from '../store/auth.store';

// ─── Placeholder page stubs ───────────────────────────────────────────────────
// These are replaced one-by-one during Phase 6+ (Layout & Pages build-out).

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-2 text-gray-500">Page not found</p>
    </div>
  </div>
);

const PlaceholderPage = ({ name }: { name: string }) => (
  <div className="flex min-h-screen items-center justify-center">
    <p className="text-gray-400 text-lg">{name} — coming in next phase</p>
  </div>
);

// ─── Auth guard ───────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <>{children}</>;
}

// ─── Router definition ────────────────────────────────────────────────────────

const router = createBrowserRouter([
  // ── Public ────────────────────────────────────────────────────────────────
  {
    path: ROUTES.LOGIN,
    element: (
      <RequireGuest>
        <PlaceholderPage name="Login Page" />
      </RequireGuest>
    ),
  },

  // ── Protected ─────────────────────────────────────────────────────────────
  {
    path: ROUTES.DASHBOARD,
    element: (
      <RequireAuth>
        <PlaceholderPage name="Dashboard" />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.COURSES,
    element: (
      <RequireAuth>
        <PlaceholderPage name="Courses List" />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.COURSE_DETAIL,
    element: (
      <RequireAuth>
        <PlaceholderPage name="Course Detail" />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.USERS,
    element: (
      <RequireAuth>
        <PlaceholderPage name="Users List" />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.PROFILE,
    element: (
      <RequireAuth>
        <PlaceholderPage name="My Profile" />
      </RequireAuth>
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
