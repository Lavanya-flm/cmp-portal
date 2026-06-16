import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Layers, Activity, Clock, CheckCircle,
  Users, ArrowRight, AlertCircle, RefreshCw,
  Zap, TrendingUp,
} from 'lucide-react';
import { AppLayout }    from '../layouts/AppLayout';
import { useDashboard } from '../hooks/useDashboard';
import { useAuthStore } from '../store/auth.store';
import { Button }       from '../components/ui/Button';
import { buildRoute, ROUTES } from '../utils/constants';
import { formatDate, getErrorMessage } from '../utils/format';
import type { DashboardSummary } from '../types';

// ─── KPI card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  iconBg: string;
  iconColor: string;
  valuColor?: string;
}

function KpiCard({ icon, label, value, iconBg, iconColor, valuColor = 'text-gray-900' }: KpiCardProps) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className={`mt-1 text-3xl font-bold leading-none ${valuColor}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Status overview bar ───────────────────────────────────────────────────────

function StatusOverview({ summary }: { summary: DashboardSummary }) {
  const total = summary.totalBatches || 1; // avoid div/0
  const items = [
    { label: 'Live',      count: summary.liveBatches,      bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
    { label: 'Upcoming',  count: summary.upcomingBatches,  bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Completed', count: summary.completedBatches, bar: 'bg-gray-400',  text: 'text-gray-600',  bg: 'bg-gray-50' },
  ];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Batch Status Overview
      </h3>
      <div className="flex flex-col gap-3">
        {items.map(({ label, count, bar, text, bg }) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bg} ${text}`}>
                  {label}
                </span>
                <span className="text-sm font-bold text-gray-700">{count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${bar} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Quick actions card ────────────────────────────────────────────────────────

function QuickActions({
  isAdmin, isSuperAdmin,
}: { isAdmin: boolean; isSuperAdmin: boolean }) {
  const navigate = useNavigate();
  if (!isAdmin) return null;

  const actions = [
    {
      icon: <BookOpen size={18} className="text-amber-500" />,
      label: 'Create Course',
      desc: 'Add a new course to the catalogue',
      onClick: () => navigate(ROUTES.COURSE_CREATE),
      show: true,
    },
    {
      icon: <Layers size={18} className="text-blue-500" />,
      label: 'Create Batch',
      desc: 'Open a new batch for enrollment',
      onClick: () => navigate(ROUTES.COURSES),
      show: true,
    },
    {
      icon: <Users size={18} className="text-purple-500" />,
      label: 'Create User',
      desc: 'Onboard a new portal user',
      onClick: () => navigate(ROUTES.USER_CREATE),
      show: isSuperAdmin,
    },
  ].filter((a) => a.show);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Quick Actions
      </h3>
      <div className="flex flex-col gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-left transition-colors hover:border-amber-200 hover:bg-amber-50/40"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              {a.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">{a.label}</p>
              <p className="text-xs text-gray-400">{a.desc}</p>
            </div>
            <ArrowRight size={14} className="ml-auto shrink-0 text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; dot: string }> = {
    Live:      { cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
    Upcoming:  { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    Completed: { cls: 'bg-gray-100 text-gray-500 border-gray-200',  dot: 'bg-gray-400' },
  };
  const { cls, dot } = map[status] ?? map.Upcoming;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

// ─── Table section wrapper ────────────────────────────────────────────────────

function TableSection({
  title, linkLabel, onLink, children,
}: { title: string; linkLabel: string; onLink: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <button
          type="button"
          onClick={onLink}
          className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
        >
          {linkLabel} <ArrowRight size={12} />
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {children}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        {icon}
      </div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}


function KpiGrid({ summary, role }: { summary: DashboardSummary | null; role: string }) {
  if (!summary) return null;

  const cards: KpiCardProps[] = role === 'SUPER_ADMIN'
    ? [
        { icon: <BookOpen size={20} />,    label: 'Total Courses',     value: summary.totalCourses,     iconBg: 'bg-amber-50',  iconColor: 'text-amber-500' },
        { icon: <Layers size={20} />,      label: 'Total Batches',     value: summary.totalBatches,     iconBg: 'bg-blue-50',   iconColor: 'text-blue-500' },
        { icon: <Activity size={20} />,    label: 'Live Batches',      value: summary.liveBatches,      iconBg: 'bg-green-50',  iconColor: 'text-green-500', valuColor: 'text-green-600' },
        { icon: <Clock size={20} />,       label: 'Upcoming Batches',  value: summary.upcomingBatches,  iconBg: 'bg-amber-50',  iconColor: 'text-amber-500' },
        { icon: <CheckCircle size={20} />, label: 'Completed Batches', value: summary.completedBatches, iconBg: 'bg-gray-100',  iconColor: 'text-gray-500' },
        { icon: <Users size={20} />,       label: 'Total Users',       value: summary.totalUsers,       iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
      ]
    : [
        { icon: <BookOpen size={20} />,    label: 'Total Courses',     value: summary.totalCourses,     iconBg: 'bg-amber-50',  iconColor: 'text-amber-500' },
        { icon: <Layers size={20} />,      label: 'Total Batches',     value: summary.totalBatches,     iconBg: 'bg-blue-50',   iconColor: 'text-blue-500' },
        { icon: <Activity size={20} />,    label: 'Live Batches',      value: summary.liveBatches,      iconBg: 'bg-green-50',  iconColor: 'text-green-500', valuColor: 'text-green-600' },
        { icon: <Clock size={20} />,       label: 'Upcoming Batches',  value: summary.upcomingBatches,  iconBg: 'bg-amber-50',  iconColor: 'text-amber-500' },
        { icon: <CheckCircle size={20} />, label: 'Completed Batches', value: summary.completedBatches, iconBg: 'bg-gray-100',  iconColor: 'text-gray-500' },
      ];

  return (
    <div className={`grid gap-4 ${role === 'SUPER_ADMIN' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
      {cards.map((c) => <KpiCard key={c.label} {...c} />)}
    </div>
  );
}

// ─── KPI skeleton ─────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="h-11 w-11 rounded-xl bg-gray-100" />
          <div className="mt-3 h-3 w-20 rounded bg-gray-100" />
          <div className="mt-2 h-8 w-12 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate     = useNavigate();
  const user         = useAuthStore((s) => s.user);
  const role         = user?.role ?? 'USER';
  const isAdmin      = role === 'SUPER_ADMIN' || role === 'SUB_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const { data, isLoading, isError, error, refetch } = useDashboard();

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="mb-7">
          <h1 className="text-3xl tracking-tight text-gray-900">
            Welcome back, {user?.firstName ? `${user.firstName} ${user.lastName}` : 'there'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage courses, batches, and learners from one place.
          </p>
        </div>

        {/* ── KPI skeleton ─────────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex flex-col gap-6">
            <KpiSkeleton />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 grid grid-cols-1 gap-6">
                <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
                <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
              </div>
              <div className="space-y-6">
                <div className="h-52 animate-pulse rounded-2xl bg-gray-100" />
                <div className="h-52 animate-pulse rounded-2xl bg-gray-100" />
              </div>
            </div>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {isError && !isLoading && (
          <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <div>
              <p className="font-semibold text-red-700">Failed to load dashboard</p>
              <p className="mt-1 text-sm text-red-500">{getErrorMessage(error)}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={13} /> Try again
            </Button>
          </div>
        )}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        {!isLoading && !isError && data && (
          <div className="flex flex-col gap-6">

            {/* KPI cards */}
            {data.summary && <KpiGrid summary={data.summary} role={data.role} />}

            {/* 3-column layout: tables (2/3) + sidebar (1/3) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* Tables column */}
              <div className="flex flex-col gap-6 lg:col-span-2">

                {/* Recent Courses */}
                <TableSection
                  title="Recent Courses"
                  linkLabel="View all courses"
                  onLink={() => navigate(ROUTES.COURSES)}
                >
                  {data.recentCourses.length === 0 ? (
                    <EmptyState icon={<BookOpen size={22} />} message="No courses yet. Create your first course." />
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/70">
                          <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Course Name
                          </th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Batches
                          </th>
                          <th className="hidden px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.recentCourses.map((c) => (
                          <tr
                            key={c.id}
                            className="group cursor-pointer hover:bg-amber-50/30 transition-colors"
                            onClick={() => navigate(buildRoute.courseDetail(c.id))}
                          >
                            <td className="px-5 py-3.5">
                              <span className="font-medium text-gray-800 group-hover:text-amber-700 transition-colors">
                                {c.name}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                {c.totalBatches}
                              </span>
                            </td>
                            <td className="hidden whitespace-nowrap px-5 py-3.5 text-right text-xs text-gray-400 sm:table-cell">
                              {formatDate(c.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </TableSection>

                {/* Recent Batches */}
                <TableSection
                  title="Recent Batches"
                  linkLabel="View all batches"
                  onLink={() => navigate(ROUTES.COURSES)}
                >
                  {data.recentBatches.length === 0 ? (
                    <EmptyState icon={<Layers size={22} />} message="No batches yet. Create your first batch." />
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/70">
                          <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Batch
                          </th>
                          <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">
                            Month & Year
                          </th>
                          <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.recentBatches.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="font-medium text-gray-800 leading-snug">{b.batchName}</p>
                              <p className="text-xs text-gray-400">{b.courseName}</p>
                            </td>
                            <td className="hidden whitespace-nowrap px-5 py-3.5 text-sm text-gray-500 sm:table-cell">
                              {b.batchMonthYear ?? '—'}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <StatusBadge status={b.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </TableSection>
              </div>

              {/* Sidebar column */}
              <div className="flex flex-col gap-6">

                {/* Status overview — only when summary exists */}
                {data.summary && <StatusOverview summary={data.summary} />}

                {/* Quick actions */}
                <QuickActions isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />

                {/* Motivational footer card */}
                {data.summary && (
                  <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <TrendingUp size={16} className="text-amber-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        At a Glance
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      {data.summary.liveBatches}
                      <span className="ml-1 text-sm font-normal text-gray-400">live right now</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {data.summary.upcomingBatches} upcoming · {data.summary.completedBatches} completed
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <Zap size={13} className="text-amber-400" />
                      <span className="text-xs text-gray-400">
                        {data.summary.totalCourses} course{data.summary.totalCourses !== 1 ? 's' : ''} · {data.summary.totalBatches} batch{data.summary.totalBatches !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
