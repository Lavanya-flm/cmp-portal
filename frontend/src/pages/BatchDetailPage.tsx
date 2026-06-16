import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight, AlertCircle, RefreshCw, Pencil, Trash2,
  Calendar, IndianRupee, Mail, BookOpen, Link2,
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useBatch, useDeleteBatch } from '../hooks/useBatches';
import { useCourse } from '../hooks/useCourses';
import { useIsSuperAdmin, useIsAdmin } from '../hooks/usePermission';
import { useToast } from '../hooks/useToast';
import { BatchOverview } from '../features/batches/components/BatchOverview';
import { BatchStatusBadge } from '../features/batches/components/BatchStatusBadge';
import { DeleteBatchDialog } from '../features/batches/components/DeleteBatchDialog';
import { ToastContainer } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { buildRoute, ROUTES } from '../utils/constants';
import { formatDate, getErrorMessage } from '../utils/format';
import type { Batch } from '../types';

// ─── Info cell ────────────────────────────────────────────────────────────────

function InfoCell({ icon, label, value }: {
  icon: React.ReactNode; label: string; value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-700">{value || '—'}</p>
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-50 px-5 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function BatchDetailPage() {
  const { courseId = '', batchId = '' } = useParams<{ courseId: string; batchId: string }>();
  const navigate = useNavigate();
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);

  const isSuperAdmin = useIsSuperAdmin();
  const isAdmin = useIsAdmin();

  const { data: course } = useCourse(courseId);
  const { data: batch, isLoading, isError, error, refetch } = useBatch(batchId);
  const { mutate: deleteBatch, isPending: isDeleting } = useDeleteBatch(courseId);
  const { toasts, addToast, removeToast } = useToast();

  const handleDeleteConfirm = () => {
    if (!batchToDelete) return;
    deleteBatch(batchToDelete.id, {
      onSuccess: () => {
        addToast(`"${batchToDelete.batchName}" deleted.`, 'success');
        setTimeout(() => navigate(buildRoute.courseDetail(courseId)), 600);
      },
      onError: (err) => { addToast(getErrorMessage(err), 'error'); setBatchToDelete(null); },
    });
  };

  // Count set resource links for the Batch Summary
  const linkCount = batch?.batchLinks
    ? Object.values(batch.batchLinks).filter((v) => typeof v === 'string' && v.startsWith('http')).length
    : 0;

  // Duration in days
  const durationDays = batch?.endDate
    ? Math.round((new Date(batch.endDate).getTime() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
          <button type="button" onClick={() => navigate(ROUTES.COURSES)}
            className="font-medium hover:text-amber-600 transition-colors">
            Courses
          </button>
          <ChevronRight size={12} className="text-gray-300" />
          <button type="button" onClick={() => navigate(buildRoute.courseDetail(courseId))}
            className="font-medium hover:text-amber-600 transition-colors">
            {course?.name ?? 'Course'}
          </button>
          {batch && (
            <>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="font-medium text-gray-700">{batch.batchName}</span>
            </>
          )}
        </nav>

        {/* Loading */}
        {isLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-7 w-1/3 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-3">
                <div className="h-24 rounded-xl bg-gray-100" />
                <div className="h-36 rounded-xl bg-gray-100" />
                <div className="h-48 rounded-xl bg-gray-100" />
              </div>
              <div className="space-y-3">
                <div className="h-36 rounded-xl bg-gray-100" />
                <div className="h-36 rounded-xl bg-gray-100" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <div>
              <p className="font-semibold text-red-700">Failed to load batch</p>
              <p className="mt-1 text-sm text-red-500">{getErrorMessage(error)}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={13} /> Try again
            </Button>
          </div>
        )}

        {/* Batch content */}
        {!isLoading && !isError && batch && (
          <div className="flex flex-col gap-5">

            {/* Page header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">{batch.batchName}</h1>
                  <BatchStatusBadge status={batch.status} />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />{formatDate(batch.startDate)} – {formatDate(batch.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee size={11} />{batch.price.toLocaleString('en-IN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail size={11} />{batch.supportEmail}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isAdmin && (
                  <Button variant="secondary" size="sm" onClick={() => navigate(buildRoute.batchEdit(courseId, batch.id))}>
                    <Pencil size={13} /> Edit Batch
                  </Button>
                )}
                {isSuperAdmin && (
                  <Button variant="danger" size="sm" onClick={() => setBatchToDelete(batch)}>
                    <Trash2 size={13} /> Delete Batch
                  </Button>
                )}
              </div>
            </div>

            {/* 2-col layout */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

              {/* LEFT — Course info + Batch info + Trainer/Links tabs */}
              <div className="flex flex-col gap-4 lg:col-span-2">

                {/* Course Information */}
                {course && (
                  <SectionCard title="Course Information">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50">
                        <BookOpen size={18} className="text-amber-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900">{course.name}</p>
                        {course.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{course.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(buildRoute.courseDetail(courseId))}
                        className="shrink-0 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        View Course →
                      </button>
                    </div>
                  </SectionCard>
                )}

                {/* Batch Information */}
                <SectionCard title="Batch Information">
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                    <InfoCell icon={<Calendar size={12} />}    label="Batch Month & Year" value={batch.batchMonthYear} />
                    <InfoCell icon={<Calendar size={12} />}    label="Start Date"         value={formatDate(batch.startDate)} />
                    <InfoCell icon={<Calendar size={12} />}    label="End Date"           value={formatDate(batch.endDate)} />
                    <InfoCell icon={<IndianRupee size={12} />} label="Price"              value={`₹${batch.price.toLocaleString('en-IN')}`} />
                    <InfoCell icon={<Mail size={12} />}        label="Support Email"      value={batch.supportEmail} />
                    {batch.trainer && (
                      <InfoCell
                        icon={<span className="text-xs font-bold text-gray-500">T</span>}
                        label="Trainer"
                        value={batch.trainer.name}
                      />
                    )}
                  </div>
                </SectionCard>

                {/* Trainer + Links tabs */}
                <BatchOverview
                  batch={batch}
                  courseId={courseId}
                  canEdit={false}
                  canDelete={false}
                  onDelete={() => {}}
                />
              </div>

              {/* RIGHT — Trainer summary + Batch Summary */}
              <div className="flex flex-col gap-4">

                {/* Trainer card */}
                <SectionCard title="Trainer">
                  {batch.trainer ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
                          {batch.trainer.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">{batch.trainer.name}</p>
                          {batch.trainer.currentCompany && (
                            <p className="truncate text-xs text-gray-500">{batch.trainer.currentCompany}</p>
                          )}
                          {batch.trainer.experience != null && (
                            <span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              {batch.trainer.experience}+ Yrs
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-gray-50 pt-2">
                        <InfoCell icon={<Mail size={11} />} label="Email" value={batch.trainer.email} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-400">No trainer assigned.</p>
                  )}
                </SectionCard>

                {/* Batch Summary — replaces Resource Links sidebar */}
                <SectionCard title="Batch Summary">
                  <div className="flex flex-col divide-y divide-gray-50">

                    {/* Status */}
                    <div className="flex items-center justify-between py-2.5 first:pt-0">
                      <span className="text-xs font-semibold text-gray-400">Status</span>
                      <BatchStatusBadge status={batch.status} />
                    </div>

                    {/* Duration */}
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs font-semibold text-gray-400">Duration</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {durationDays != null ? `${durationDays} Days` : '—'}
                      </span>
                    </div>

                    {/* Trainer */}
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs font-semibold text-gray-400">Trainer</span>
                      <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                        {batch.trainer?.name ?? '—'}
                      </span>
                    </div>

                    {/* Support Email */}
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs font-semibold text-gray-400">Support</span>
                      <span className="text-xs font-medium text-gray-600 truncate max-w-[140px]">
                        {batch.supportEmail}
                      </span>
                    </div>

                    {/* Resources */}
                    <div className="flex items-center justify-between py-2.5 last:pb-0">
                      <span className="text-xs font-semibold text-gray-400">Resources</span>
                      <span className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                        <Link2 size={12} className="text-gray-400" />
                        {linkCount} {linkCount === 1 ? 'Link' : 'Links'}
                      </span>
                    </div>
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteBatchDialog
        batch={batchToDelete}
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBatchToDelete(null)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
