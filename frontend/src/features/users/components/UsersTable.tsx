import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, UserCog, Eye } from 'lucide-react';
import type { User } from '../../../types';
import { buildRoute } from '../../../utils/constants';
import { formatDate, fullName } from '../../../utils/format';
import { UserAvatar } from './UserAvatar';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import { UsersEmptyState } from './UsersEmptyState';
import { UsersLoadingState } from './UsersLoadingState';

const TH = 'px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  filtered: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangeRole: boolean;
  onDelete: (user: User) => void;
  onChangeRole: (user: User) => void;
}

export function UsersTable({
  users,
  isLoading,
  filtered,
  canEdit,
  canDelete,
  canChangeRole,
  onDelete,
  onChangeRole,
}: UsersTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {/* Sticky header */}
          <thead className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
            <tr>
              <th className={TH}>Name</th>
              <th className={TH}>Email</th>
              <th className={TH}>Role</th>
              <th className={TH}>Status</th>
              <th className={TH}>Created At</th>
              <th className={`${TH} text-right`}>Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {isLoading && <UsersLoadingState rows={5} />}

            {!isLoading && users.length === 0 && <UsersEmptyState filtered={filtered} />}

            {!isLoading && users.map((user) => (
              <tr
                key={user.id}
                className="group transition-colors hover:bg-amber-50/30"
              >
                {/* Name + avatar */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {fullName(user.firstName, user.lastName)}
                      </p>
                      <p className="truncate text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3.5 text-gray-600">{user.email}</td>

                {/* Role */}
                <td className="px-4 py-3.5">
                  <RoleBadge role={user.role} />
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <StatusBadge isActive={user.isActive} />
                </td>

                {/* Created at */}
                <td className="px-4 py-3.5 text-gray-500">{formatDate(user.createdAt)}</td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    {/* View */}
                    <button
                      type="button"
                      onClick={() => navigate(buildRoute.userDetail(user.id))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      aria-label="View user"
                    >
                      <Eye size={13} />
                    </button>

                    {/* Edit */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => navigate(buildRoute.userEdit(user.id))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        aria-label="Edit user"
                      >
                        <Pencil size={13} />
                      </button>
                    )}

                    {/* Change role */}
                    {canChangeRole && (
                      <button
                        type="button"
                        onClick={() => onChangeRole(user)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        aria-label="Change role"
                      >
                        <UserCog size={13} />
                      </button>
                    )}

                    {/* Delete */}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(user)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        aria-label="Delete user"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
