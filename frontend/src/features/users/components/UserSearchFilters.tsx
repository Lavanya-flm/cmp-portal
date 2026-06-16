import { Search, ChevronDown } from 'lucide-react';
import type { Role } from '../../../types';

export type RoleFilter = 'ALL' | Role;
export type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

interface UserSearchFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: RoleFilter;
  onRoleChange: (v: RoleFilter) => void;
  statusFilter: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
}

function SelectFilter<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-10 appearance-none rounded-lg border border-gray-300 bg-white pl-3.5 pr-8 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-gray-400 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export function UserSearchFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}: UserSearchFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[260px] flex-1">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or email…"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-gray-400 transition-colors"
        />
      </div>

      {/* Role filter */}
      <SelectFilter<RoleFilter>
        value={roleFilter}
        onChange={onRoleChange}
        options={[
          { value: 'ALL',         label: 'All Roles'    },
          { value: 'SUPER_ADMIN', label: 'Super Admin'  },
          { value: 'SUB_ADMIN',   label: 'Sub Admin'    },
          { value: 'USER',        label: 'User'          },
        ]}
      />

      {/* Status filter */}
      <SelectFilter<StatusFilter>
        value={statusFilter}
        onChange={onStatusChange}
        options={[
          { value: 'ALL',      label: 'All Status' },
          { value: 'ACTIVE',   label: 'Active'     },
          { value: 'INACTIVE', label: 'Inactive'   },
        ]}
      />
    </div>
  );
}
