import type { Role } from '../../../types';

const config: Record<Role, { label: string; classes: string }> = {
  SUPER_ADMIN: {
    label: 'SUPER_ADMIN',
    classes: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
  SUB_ADMIN: {
    label: 'SUB_ADMIN',
    classes: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  USER: {
    label: 'USER',
    classes: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
};

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const { label, classes } = config[role] ?? {
    label: role,
    classes: 'bg-gray-100 text-gray-600 border border-gray-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${classes}`}>
      {label}
    </span>
  );
}
