import { Users } from 'lucide-react';

interface UsersEmptyStateProps {
  filtered?: boolean;
}

export function UsersEmptyState({ filtered = false }: UsersEmptyStateProps) {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <Users size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            {filtered ? 'No users match your search' : 'No users yet'}
          </p>
          <p className="max-w-xs text-xs text-gray-400">
            {filtered
              ? 'Try adjusting your search or filter criteria.'
              : 'Users will appear here once created.'}
          </p>
        </div>
      </td>
    </tr>
  );
}
