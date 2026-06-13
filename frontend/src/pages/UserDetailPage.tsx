import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, AlertCircle, RefreshCw,
  Mail, Shield, Calendar, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useUser } from '../hooks/useUsers';
import { useIsSuperAdmin } from '../hooks/usePermission';
import { Button } from '../components/ui/Button';
import { UserAvatar } from '../features/users/components/UserAvatar';
import { RoleBadge } from '../features/users/components/RoleBadge';
import { StatusBadge } from '../features/users/components/StatusBadge';
import { ROUTES } from '../utils/constants';
import { formatDate, formatDateTime, getErrorMessage } from '../utils/format';
import { buildRoute } from '../utils/constants';

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-b-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-gray-700">{children}</div>
      </div>
    </div>
  );
}

export function UserDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isSuperAdmin = useIsSuperAdmin();

  const { data: user, isLoading, isError, error, refetch } = useUser(id);

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
          <button type="button" onClick={() => navigate(ROUTES.USERS)}
            className="font-medium hover:text-amber-600 transition-colors">Users</button>
          {user && (
            <>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="font-medium text-gray-700">{user.firstName} {user.lastName}</span>
            </>
          )}
        </nav>

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.USERS)}
          className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft size={15} /> Back to Users
        </button>

        {/* Loading */}
        {isLoading && (
          <div className="animate-pulse max-w-2xl space-y-4">
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-48 rounded-2xl bg-gray-100" />
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <div>
              <p className="font-semibold text-red-700">Failed to load user</p>
              <p className="mt-1 text-sm text-red-500">{getErrorMessage(error)}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={13} /> Try again
            </Button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && user && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            {/* Left — profile card */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
              <UserAvatar user={user} size="md" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge isActive={user.isActive} />
              </div>

              {/* Actions — SUPER_ADMIN only */}
              {isSuperAdmin && (
                <div className="flex flex-col gap-2 w-full pt-2 border-t border-gray-100">
                  <Button variant="secondary" size="sm" fullWidth onClick={() => navigate(buildRoute.userEdit(id))}>
                    Edit User
                  </Button>
                </div>
              )}
            </div>

            {/* Right — details */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2 overflow-hidden">
              <div className="border-b border-gray-50 px-5 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Account Details</h3>
              </div>
              <div className="px-5">
                <InfoRow icon={<Mail size={13} />} label="Email">
                  {user.email}
                </InfoRow>
                <InfoRow icon={<Shield size={13} />} label="Role">
                  <RoleBadge role={user.role} />
                </InfoRow>
                <InfoRow icon={user.isActive ? <CheckCircle2 size={13} className="text-green-500" /> : <XCircle size={13} className="text-red-400" />} label="Status">
                  <StatusBadge isActive={user.isActive} />
                </InfoRow>
                <InfoRow icon={<CheckCircle2 size={13} />} label="Email Verified">
                  <span className={user.isEmailVerified ? 'text-green-600' : 'text-gray-400'}>
                    {user.isEmailVerified ? 'Verified' : 'Not verified'}
                  </span>
                </InfoRow>
                <InfoRow icon={<Calendar size={13} />} label="Created At">
                  {formatDate(user.createdAt)}
                </InfoRow>
                <InfoRow icon={<Clock size={13} />} label="Last Login">
                  {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
                </InfoRow>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
