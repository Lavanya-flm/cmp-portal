import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight, Pencil, Trash2, Plus, AlertCircle, RefreshCw,
  LayoutGrid, Calendar, Clock, TrendingUp,
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useCourse, useDeleteCourse } from '../hooks/useCourses';
import { useBatches, useDeleteBatch } from '../hooks/useBatches';
import { useIsSuperAdmin, useIsAdmin } from '../hooks/usePermission';
import { useToast } from '../hooks/useToast';
import { CourseImage } from '../features/courses/components/CourseImage';
import { CourseStatusBadge, deriveCourseStatus } from '../features/courses/components/CourseStatusBadge';
import { DeleteCourseDialog } from '../features/courses/components/DeleteCourseDialog';
import { BatchGrid } from '../features/batches/components/BatchGrid';
import { BatchLoadingState } from '../features/batches/components/BatchLoadingState';
import { BatchEmptyState } from '../features/batches/components/BatchEmptyState';
import { DeleteBatchDialog } from '../features/batches/components/DeleteBatchDialog';
import { ToastContainer } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { buildRoute, ROUTES } from '../utils/constants';
import { formatDate, getErrorMessage } from '../utils/format';
import type { Batch, Course } from '../types';

type Tab = 'overview' | 'batches';

function TabBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'pb-3 px-1 mr-8 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
        active ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-800',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function StatCard({ icon, label, value, accent = false }: {
  icon: React.ReactNode; label: string; value: string | number; accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-400'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function CourseDetailPage() {
  const { id: courseId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showDeleteCourse, setShowDeleteCourse] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);

  const isSuperAdmin = useIsSuperAdmin();
  const isAdmin = useIsAdmin();

  const { data: course, isLoading: courseLoading, isError: courseError, error: courseErr, refetch } = useCourse(courseId);
  const { mutate: deleteCourse, isPending: isDeletingCourse } = useDeleteCourse();
  const { data: batchData, isLoading: batchLoading } = useBatches(courseId, { limit: 100 });
  const batches = batchData?.data ?? [];
  const { mutate: deleteBatch, isPending: isDeletingBatch } = useDeleteBatch(courseId);
  const { toasts, addToast, removeToast } = useToast();

  const priceMin = batches.length ? Math.min(...batches.map((b) => b.price)) : null;
  const priceMax = batches.length ? Math.max(...batches.map((b) => b.price)) : null;
  const priceRange = priceMin != null && priceMax != null
    ? priceMin === priceMax
      ? `₹${priceMin.toLocaleString('en-IN')}`
      : `₹${priceMin.toLocaleString('en-IN')} – ₹${priceMax.toLocaleString('en-IN')}`
    : '—';

  const handleDeleteCourse = () => {
    if (!course) return;
    deleteCourse(course.id, {
      onSuccess: () => { addToast(`"${course.name}" deleted.`, 'success'); setTimeout(() => navigate(ROUTES.COURSES), 600); },
      onError: (err) => { addToast(getErrorMessage(err), 'error'); setShowDeleteCourse(false); },
    });
  };

  const handleDeleteBatch = () => {
    if (!batchToDelete) return;
    deleteBatch(batchToDelete.id, {
      onSuccess: () => { addToast(`"${batchToDelete.batchName}" deleted.`, 'success'); setBatchToDelete(null); },
      onError: (err) => { addToast(getErrorMessage(err), 'error'); setBatchToDelete(null); },
    });
  };

  const status = course ? deriveCourseStatus(course as Course, batches) : 'draft';

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
          <button type="button" onClick={() => navigate(ROUTES.COURSES)} className="hover:text-amber-600 transition-colors font-medium">Courses</button>
          {course && (<><ChevronRight size={12} className="text-gray-300" /><span className="font-medium text-gray-700">{course.name}</span></>)}
        </nav>

        {/* Loading */}
        {courseLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-7 w-1/3 rounded bg-gray-200" />
            <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100" />)}</div>
          </div>
        )}

        {/* Error */}
        {courseError && !courseLoading && (
          <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <div><p className="font-semibold text-red-700">Failed to load course</p><p className="mt-1 text-sm text-red-500">{getErrorMessage(courseErr)}</p></div>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}><RefreshCw size={13} /> Try again</Button>
          </div>
        )}

        {/* Content */}
        {!courseLoading && !courseError && course && (
          <div className="flex flex-col gap-5">

            {/* Page header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">{course.name}</h1>
                  <CourseStatusBadge status={status} />
                </div>
                {course.description && (
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 leading-relaxed line-clamp-2">{course.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isAdmin && (
                  <Button variant="secondary" size="sm" onClick={() => navigate(buildRoute.courseEdit(courseId))}>
                    <Pencil size={13} /> Edit Course
                  </Button>
                )}
                {isSuperAdmin && (
                  <Button variant="danger" size="sm" onClick={() => setShowDeleteCourse(true)}>
                    <Trash2 size={13} /> Delete Course
                  </Button>
                )}
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard icon={<LayoutGrid size={15} />} label="Total Batches" value={batchData?.meta.total ?? '—'} accent />
              <StatCard icon={<TrendingUp size={15} />} label="Price Range"   value={priceRange} />
              <StatCard icon={<Calendar size={15} />}   label="Created On"    value={formatDate(course.createdAt)} />
              <StatCard icon={<Clock size={15} />}      label="Last Updated"  value={formatDate(course.updatedAt)} />
              {/* Status card */}
              <div className="col-span-2 sm:col-span-1 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                  <span className="text-xs">●</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</p>
                  <CourseStatusBadge status={status} />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <TabBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabBtn>
                <TabBtn active={activeTab === 'batches'} onClick={() => setActiveTab('batches')}>
                  Batches
                  {batches.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">{batches.length}</span>
                  )}
                </TabBtn>
              </div>
            </div>

            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="overflow-hidden rounded-2xl shadow-sm lg:col-span-1">
                  <CourseImage courseName={course.name} className="h-52 w-full" />
                </div>
                <div className="flex flex-col gap-0 lg:col-span-2 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-gray-50 px-5 py-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Description</h2>
                  </div>
                  <div className="p-5 flex-1">
                    {course.description ? (
                      <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{course.description}</p>
                    ) : (
                      <p className="text-sm italic text-gray-400">No description provided.</p>
                    )}
                  </div>
                </div>

                {/* Recent batches */}
                {!batchLoading && batches.length > 0 && (
                  <div className="lg:col-span-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-gray-700">Recent Batches</h2>
                      <button type="button" onClick={() => setActiveTab('batches')} className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
                        View all {batches.length} →
                      </button>
                    </div>
                    <BatchGrid batches={batches.slice(0, 3)} courseId={courseId} canEdit={isAdmin} canDelete={isSuperAdmin} onDelete={setBatchToDelete} />
                  </div>
                )}
              </div>
            )}

            {/* Batches tab */}
            {activeTab === 'batches' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">
                    All Batches{batches.length > 0 && <span className="ml-2 text-gray-400 font-normal">({batches.length})</span>}
                  </h2>
                  {isAdmin && (
                    <Button variant="primary" size="sm" onClick={() => navigate(buildRoute.batchCreate(courseId))}>
                      <Plus size={14} /> Create Batch
                    </Button>
                  )}
                </div>
                {batchLoading && <BatchLoadingState count={3} />}
                {!batchLoading && batches.length === 0 && <BatchEmptyState canCreate={isAdmin} onCreateClick={() => navigate(buildRoute.batchCreate(courseId))} />}
                {!batchLoading && batches.length > 0 && <BatchGrid batches={batches} courseId={courseId} canEdit={isAdmin} canDelete={isSuperAdmin} onDelete={setBatchToDelete} />}
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteCourseDialog course={showDeleteCourse ? course ?? null : null} loading={isDeletingCourse} onConfirm={handleDeleteCourse} onCancel={() => setShowDeleteCourse(false)} />
      <DeleteBatchDialog batch={batchToDelete} loading={isDeletingBatch} onConfirm={handleDeleteBatch} onCancel={() => setBatchToDelete(null)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
