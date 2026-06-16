import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, Calendar, User, Mail, IndianRupee } from 'lucide-react';
import type { Batch } from '../../../types';
import { buildRoute } from '../../../utils/constants';
import { formatDate } from '../../../utils/format';
import { BatchStatusBadge } from './BatchStatusBadge';

// ─── Avatar colors ────────────────────────────────────────────────────────────

const avatarColors = [
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'bg-amber-100 text-amber-700 border-amber-200',
];

// ─── Icon cell with bordered container ───────────────────────────────────────

function MetaCell({ icon, label, value }: {
  icon: React.ReactNode; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="truncate text-xs font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BatchCardProps {
  batch: Batch;
  courseId: string;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (batch: Batch) => void;
}

export function BatchCard({ batch, courseId, canEdit, canDelete, onDelete }: BatchCardProps) {
  const navigate = useNavigate();
  const color = avatarColors[(batch.batchNumber - 1) % avatarColors.length];

  const goToDetail = () => navigate(buildRoute.batchDetail(courseId, batch.id));

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">

      {/* Batch avatar */}
      <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border ${color} text-sm font-bold`}>
        <span className="text-[10px] font-semibold opacity-80">B{batch.batchNumber}</span>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center gap-6 min-w-0">

        {/* Name + status — fixed left */}
        <div className="flex min-w-[160px] flex-col gap-1">
          <button
            type="button"
            onClick={goToDetail}
            className="text-sm font-semibold text-gray-900 hover:text-amber-600 transition-colors text-left truncate"
          >
            {batch.batchName}
          </button>
          <BatchStatusBadge status={batch.status} />
        </div>

        {/* Meta cells — all aligned on same baseline */}
        <div className="hidden sm:flex flex-1 items-center gap-5">
          <MetaCell icon={<Calendar size={11} />} label="Start"   value={formatDate(batch.startDate)} />
          <MetaCell icon={<Calendar size={11} />} label="End"     value={formatDate(batch.endDate)} />
          {batch.trainer && (
            <MetaCell icon={<User size={11} />}   label="Trainer" value={batch.trainer.name} />
          )}
          <MetaCell icon={<Mail size={11} />}     label="Support" value={batch.supportEmail} />
        </div>

        {/* Price — aligned with meta cells */}
        <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-800">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400">
            <IndianRupee size={11} />
          </div>
          <span>{batch.price.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={goToDetail}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="View batch"
        >
          <Eye size={13} />
        </button>
        {canEdit && (
          <button
            type="button"
            onClick={() => navigate(buildRoute.batchEdit(courseId, batch.id))}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
            aria-label="Edit batch"
          >
            <Pencil size={13} />
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(batch)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Delete batch"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
