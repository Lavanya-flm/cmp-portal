import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useUsers, useDeleteUser, useChangeRole } from '../hooks/useUsers';
import { useIsSuperAdmin } from '../hooks/usePermission';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../hooks/useToast';
import { UsersTable } from '../features/users/components/UsersTable';
import { UserSearchFilters } from '../features/users/components/UserSearchFilters';
import { DeleteUserDialog } from '../features/users/components/DeleteUserDialog';
import { ChangeRoleDialog } from '../features/users/components/ChangeRoleDialog';
import { TablePagination } from '../features/users/components/TablePagination';
import { ToastContainer } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/format';
import type { User, Role } from '../types';
import type { RoleFilter, StatusFilter } from '../features/users/components/UserSearchFilters';

const PAGE_SIZE = 10;

export function UsersPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = useIsSuperAdmin();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage]               = useState(1);

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [userToDelete, setUserToDelete]   = useState<User | null>(null);
  const [userToRole, setUserToRole]       = useState<User | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, error, refetch } = useUsers({ limit: 100 });
  const allUsers = data?.data ?? [];

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: changeRole, isPending: isChangingRole } = useChangeRole(userToRole?.id ?? '');
  const { toasts, addToast, removeToast } = useToast();

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allUsers.filter((u) => {
      const matchSearch = !q
        || u.firstName.toLowerCase().includes(q)
        || u.lastName.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q);
      const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL'
        || (statusFilter === 'ACTIVE' && u.isActive)
        || (statusFilter === 'INACTIVE' && !u.isActive);
      return matchSearch && matchRole && matchStatus;
    });
  }, [allUsers, search, roleFilter, statusFilter]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paged       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered  = Boolean(search) || roleFilter !== 'ALL' || statusFilter !== 'ALL';

  // Reset to page 1 on filter change
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleRole   = (v: RoleFilter)   => { setRoleFilter(v); setPage(1); };
  const handleStatus = (v: StatusFilter) => { setStatusFilter(v); setPage(1); };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id, {
      onSuccess: () => { addToast(`${userToDelete.firstName} deleted.`, 'success'); setUserToDelete(null); },
      onError: (err) => { addToast(getErrorMessage(err), 'error'); setUserToDelete(null); },
    });
  };

  const handleRoleConfirm = (role: Role) => {
    if (!userToRole) return;
    changeRole({ role }, {
      onSuccess: () => { addToast('Role updated successfully.', 'success'); setUserToRole(null); },
      onError: (err) => { addToast(getErrorMessage(err), 'error'); setUserToRole(null); },
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
          <button type="button" onClick={() => navigate(ROUTES.DASHBOARD)} className="font-medium hover:text-amber-600 transition-colors">Dashboard</button>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="font-medium text-gray-700">Users</span>
        </nav>

        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Users</h1>
            <p className="mt-0.5 text-sm text-gray-500">Browse and manage all portal users</p>
          </div>
          {isSuperAdmin && (
            <Button variant="primary" size="md" onClick={() => navigate(ROUTES.USER_CREATE)}>
              <Plus size={15} /> Create User
            </Button>
          )}
        </div>

        {/* Search + filters */}
        <div className="mb-5">
          <UserSearchFilters
            search={search}
            onSearchChange={handleSearch}
            roleFilter={roleFilter}
            onRoleChange={handleRole}
            statusFilter={statusFilter}
            onStatusChange={handleStatus}
          />
        </div>

        {/* Error */}
        {isError && !isLoading && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span className="flex-1">{getErrorMessage(error)}</span>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}><RefreshCw size={13} /> Retry</Button>
          </div>
        )}

        {/* Table */}
        <UsersTable
          users={paged}
          isLoading={isLoading}
          filtered={isFiltered}
          canEdit={isSuperAdmin}
          canDelete={isSuperAdmin}
          canChangeRole={isSuperAdmin}
          onDelete={setUserToDelete}
          onChangeRole={setUserToRole}
        />

        {/* Pagination */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            limit={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}

        {/* Summary below table when no pagination */}
        {!isLoading && filtered.length > 0 && filtered.length <= PAGE_SIZE && (
          <p className="mt-3 px-1 text-xs text-gray-400">
            Showing {filtered.length} of {allUsers.length} users
            {currentUser && ` · Logged in as ${currentUser.email}`}
          </p>
        )}
      </div>

      <DeleteUserDialog user={userToDelete} loading={isDeleting} onConfirm={handleDeleteConfirm} onCancel={() => setUserToDelete(null)} />
      <ChangeRoleDialog user={userToRole} loading={isChangingRole} onConfirm={handleRoleConfirm} onCancel={() => setUserToRole(null)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
