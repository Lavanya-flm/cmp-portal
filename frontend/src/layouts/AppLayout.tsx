import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useLogout } from '../hooks/useAuth';
import { useHasRole, useIsSuperAdmin } from '../hooks/usePermission';
import { ROUTES } from '../utils/constants';
import { formatRole, fullName } from '../utils/format';
import type { Role } from '../types';

// ─── Nav item definition ──────────────────────────────────────────────────────

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: ROUTES.DASHBOARD,
    icon: <LayoutDashboard size={18} />,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'USER'],
  },
  {
    label: 'Courses',
    to: ROUTES.COURSES,
    icon: <BookOpen size={18} />,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN', 'USER'],
  },
  {
    label: 'Users',
    to: ROUTES.USERS,
    icon: <Users size={18} />,
    // Hidden for USER role — only SUPER_ADMIN + SUB_ADMIN
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
];

// ─── Role badge ───────────────────────────────────────────────────────────────

const roleBadgeColors: Record<Role, string> = {
  SUPER_ADMIN: 'bg-amber-100 text-amber-700',
  SUB_ADMIN: 'bg-blue-100 text-blue-700',
  USER: 'bg-gray-100 text-gray-600',
};

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${roleBadgeColors[role]}`}
    >
      {formatRole(role)}
    </span>
  );
}

// ─── Sidebar nav link ─────────────────────────────────────────────────────────

function SideNavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const userRole = useAuthStore((s) => s.user?.role);
  if (!userRole || !item.roles.includes(userRole)) return null;

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-amber-50 text-amber-600 shadow-sm ring-1 ring-amber-100'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-amber-500' : 'text-gray-400'}>
            {item.icon}
          </span>
          {item.label}
        </>
      )}
    </NavLink>
  );
}

// ─── User menu (profile dropdown) ────────────────────────────────────────────

function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending } = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
      >
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow-sm">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {fullName(user.firstName, user.lastName)}
          </p>
          <p className="truncate text-xs text-gray-500">{user.email}</p>
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-gray-100">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">
                {fullName(user.firstName, user.lastName)}
              </p>
              <RoleBadge role={user.role} />
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(ROUTES.PROFILE);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              My Profile
            </button>
            <div className="border-t border-gray-100" />
            <button
              type="button"
              onClick={() => logout()}
              disabled={isPending}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <LogOut size={14} />
              {isPending ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-sm">
            <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5" aria-hidden="true">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">CMP Portal</p>
            <p className="text-[10px] text-gray-400">Course Management</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <SideNavLink key={item.to} item={item} onClick={onClose} />
        ))}
      </nav>

      {/* User menu */}
      <div className="border-t border-gray-100 px-3 py-3">
        <UserMenu />
      </div>
    </div>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = useIsSuperAdmin();
  const isAdmin = useHasRole('SUPER_ADMIN', 'SUB_ADMIN');

  return (
    <div className="flex h-screen bg-[#FFF9F1]">
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden w-60 shrink-0 overflow-hidden border-r border-gray-200 lg:block">
        <Sidebar />
      </aside>

      {/* ── Mobile sidebar overlay ────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-40 w-64 overflow-hidden shadow-xl lg:hidden">
            <Sidebar onClose={() => setMobileSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500">
              <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4" aria-hidden="true">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">CMP Portal</span>
          </div>
          {/* Role info visible on mobile */}
          {user && <RoleBadge role={user.role} />}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {/* Suppress unused variable warnings — these are available for child pages */}
          <div data-super-admin={isSuperAdmin} data-admin={isAdmin} className="hidden" />
          {children}
        </main>
      </div>
    </div>
  );
}
