import { AppLayout } from '../layouts/AppLayout';
import { useAuthStore } from '../store/auth.store';
import { formatRole } from '../utils/format';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user ? user.firstName : 'there'} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            You are signed in as{' '}
            <span className="font-medium text-amber-600">
              {user ? formatRole(user.role) : '—'}
            </span>
            . More pages are coming in the next phase.
          </p>
        </div>

        {/* Quick-stat cards — placeholder */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Courses', value: '—', color: 'bg-amber-50 text-amber-600' },
            { label: 'Total Batches', value: '—', color: 'bg-blue-50 text-blue-600' },
            { label: 'Active Trainers', value: '—', color: 'bg-green-50 text-green-600' },
            { label: 'Total Users', value: '—', color: 'bg-purple-50 text-purple-600' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Coming-soon note */}
        <div className="mt-10 rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-8 text-center">
          <p className="text-sm font-medium text-amber-700">
            Full dashboard with charts and live data is coming in the next phase.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
