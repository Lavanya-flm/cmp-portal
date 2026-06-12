import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useCourses, useDeleteCourse } from '../hooks/useCourses';
import { useIsSuperAdmin, useIsAdmin } from '../hooks/usePermission';
import { useToast } from '../hooks/useToast';
import { CourseGrid } from '../features/courses/components/CourseGrid';
import { CourseSearch } from '../features/courses/components/CourseSearch';
import { LoadingState } from '../features/courses/components/LoadingState';
import { EmptyState } from '../features/courses/components/EmptyState';
import { DeleteCourseDialog } from '../features/courses/components/DeleteCourseDialog';
import { ToastContainer } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/format';
import type { Course } from '../types';

export function CoursesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const isSuperAdmin = useIsSuperAdmin();
  const isAdmin = useIsAdmin();

  const { data, isLoading, isError, error, refetch } = useCourses({ limit: 100 });
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const { toasts, addToast, removeToast } = useToast();

  // Client-side search filter
  const filteredCourses = useMemo(() => {
    const all = data?.data ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((c) => c.name.toLowerCase().includes(q));
  }, [data, search]);

  const handleDeleteConfirm = () => {
    if (!courseToDelete) return;
    deleteCourse(courseToDelete.id, {
      onSuccess: () => {
        addToast(`"${courseToDelete.name}" has been deleted.`, 'success');
        setCourseToDelete(null);
      },
      onError: (err) => {
        addToast(getErrorMessage(err), 'error');
        setCourseToDelete(null);
      },
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6 lg:p-8">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Browse and manage all available courses
            </p>
          </div>

          {isAdmin && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(ROUTES.COURSE_CREATE)}
            >
              <Plus size={16} />
              Create Course
            </Button>
          )}
        </div>

        {/* ── Search bar ───────────────────────────────────────────────────── */}
        <CourseSearch value={search} onChange={setSearch} />

        {/* ── Content area ─────────────────────────────────────────────────── */}
        {isLoading && <LoadingState count={6} />}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle size={32} className="text-red-400" />
            <div>
              <p className="font-semibold text-red-700">Failed to load courses</p>
              <p className="mt-1 text-sm text-red-500">{getErrorMessage(error)}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={14} />
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredCourses.length === 0 && (
          <EmptyState
            title={search ? 'No courses match your search' : 'No courses yet'}
            description={
              search
                ? `No courses found for "${search}". Try a different search term.`
                : 'Get started by creating your first course.'
            }
            filtered={Boolean(search)}
            onAction={isAdmin ? () => navigate(ROUTES.COURSE_CREATE) : undefined}
          />
        )}

        {!isLoading && !isError && filteredCourses.length > 0 && (
          <CourseGrid
            courses={filteredCourses}
            canEdit={isAdmin}
            canDelete={isSuperAdmin}
            onDelete={setCourseToDelete}
          />
        )}
      </div>

      {/* ── Delete confirmation dialog ────────────────────────────────────── */}
      <DeleteCourseDialog
        course={courseToDelete}
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCourseToDelete(null)}
      />

      {/* ── Toast notifications ───────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
