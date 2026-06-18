import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight, Pencil, Trash2, Plus, AlertCircle, RefreshCw,
  LayoutGrid, Activity, Clock, CheckCircle2, CheckCircle,
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useCourse, useDeleteCourse } from '../hooks/useCourses';
import { useBatches, useDeleteBatch } from '../hooks/useBatches';
import { useIsSuperAdmin, useIsAdmin } from '../hooks/usePermission';
import { useToast } from '../hooks/useToast';
import { CourseImage } from '../features/courses/components/CourseImage';
import { DeleteCourseDialog } from '../features/courses/components/DeleteCourseDialog';
import { BatchGrid } from '../features/batches/components/BatchGrid';
import { BatchLoadingState } from '../features/batches/components/BatchLoadingState';
import { BatchEmptyState } from '../features/batches/components/BatchEmptyState';
import { DeleteBatchDialog } from '../features/batches/components/DeleteBatchDialog';
import { ToastContainer } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { buildRoute, ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/format';
import type { Batch } from '../types';

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

function TopStatCard({ icon, label, value, accent = false }: {
  icon: React.ReactNode; label: string; value: string | number; accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-400'}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none text-gray-900">{value}</p>
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

  const liveBatches      = batches.filter((b) => b.status === 'Live').length;
  const upcomingBatches  = batches.filter((b) => b.status === 'Upcoming').length;
  const completedBatches = batches.filter((b) => b.status === 'Completed').length;
  const totalBatches     = batchData?.meta.total ?? '—';

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

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
          <button type="button" onClick={() => navigate(ROUTES.COURSES)} className="font-medium hover:text-amber-600 transition-colors">Courses</button>
          {course && (<><ChevronRight size={12} className="text-gray-300" /><span className="font-medium text-gray-700">{course.name}</span></>)}
        </nav>

        {/* Loading */}
        {courseLoading && (
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-1/3 rounded-lg bg-gray-200" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100" />)}
            </div>
            <div className="flex gap-5">
              <div className="h-72 w-[42%] rounded-2xl bg-gray-200" />
              <div className="flex-1 space-y-4"><div className="h-32 rounded-xl bg-gray-100" /><div className="h-40 rounded-xl bg-gray-100" /></div>
            </div>
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

        {/* Main content */}
        {!courseLoading && !courseError && course && (
          <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{course.name}</h1>
                {course.description && (
                  <p className="mt-1.5 max-w-2xl text-sm text-gray-500 leading-relaxed line-clamp-2">{course.description}</p>
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <TopStatCard icon={<LayoutGrid size={18} />}  label="Total Batches"     value={totalBatches}     accent />
              <TopStatCard icon={<Activity size={18} />}    label="Live Batches"      value={liveBatches} />
              <TopStatCard icon={<Clock size={18} />}       label="Upcoming Batches"  value={upcomingBatches} />
              <TopStatCard icon={<CheckCircle size={18} />} label="Completed Batches" value={completedBatches} />
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
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">

                  {/* Banner */}
                  <div className="w-full shrink-0 lg:w-[42%]">
                    <div className="h-full min-h-[280px] overflow-hidden rounded-2xl shadow-sm">
                      <CourseImage courseName={course.name} imageUrl={course.bannerImage} className="h-full w-full object-cover" />
                    </div>
                  </div>

                  {/* Description + What You Will Learn */}
                  <div className="flex flex-1 flex-col gap-4">

                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                      <div className="border-b border-gray-50 px-5 py-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Description</h2>
                      </div>
                      <div className="p-5">
                        {course.description
                          ? <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{course.description}</p>
                          : <p className="text-sm italic text-gray-400">No description provided.</p>
                        }
                      </div>
                    </div>

                    {/* What You Will Learn — hidden when empty, column-fill layout */}
                    {course.whatYouWillLearn && course.whatYouWillLearn.split('\n').some((s) => s.trim()) && (() => {
                      const items = course.whatYouWillLearn!.split('\n').map((s) => s.trim()).filter(Boolean);
                      const mid   = Math.ceil(items.length / 2);
                      const left  = items.slice(0, mid);
                      const right = items.slice(mid);
                      return (
                        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                          <div className="border-b border-gray-50 px-5 py-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">What You Will Learn</h2>
                          </div>
                          <div className="flex px-5 py-2">
                            <ul className="flex-1">
                              {left.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 py-1.5 text-sm text-gray-700">
                                  <CheckCircle2 size={13} className="shrink-0 text-amber-500" />
                                  <span className="leading-snug">{item}</span>
                                </li>
                              ))}
                            </ul>
                            {right.length > 0 && (
                              <ul className="flex-1">
                                {right.map((item, i) => (
                                  <li key={i} className="flex items-center gap-2 py-1.5 text-sm text-gray-700">
                                    <CheckCircle2 size={13} className="shrink-0 text-amber-500" />
                                    <span className="leading-snug">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Recent Batches */}
                {!batchLoading && batches.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-gray-700">Recent Batches</h2>
                      <button type="button" onClick={() => setActiveTab('batches')}
                        className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
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
                    All Batches{batches.length > 0 && <span className="ml-2 font-normal text-gray-400">({batches.length})</span>}
                  </h2>
                  {isAdmin && (
                    <Button variant="primary" size="sm" onClick={() => navigate(buildRoute.batchCreate(courseId))}>
                      <Plus size={14} /> Create Batch
                    </Button>
                  )}
                </div>
                {batchLoading && <BatchLoadingState count={3} />}
                {!batchLoading && batches.length === 0 && (
                  <BatchEmptyState canCreate={isAdmin} onCreateClick={() => navigate(buildRoute.batchCreate(courseId))} />
                )}
                {!batchLoading && batches.length > 0 && (
                  <BatchGrid batches={batches} courseId={courseId} canEdit={isAdmin} canDelete={isSuperAdmin} onDelete={setBatchToDelete} />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteCourseDialog
        course={showDeleteCourse ? course ?? null : null}
        loading={isDeletingCourse}
        onConfirm={handleDeleteCourse}
        onCancel={() => setShowDeleteCourse(false)}
      />
      <DeleteBatchDialog
        batch={batchToDelete}
        loading={isDeletingBatch}
        onConfirm={handleDeleteBatch}
        onCancel={() => setBatchToDelete(null)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
