import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  ChevronLeft, Pencil, Trash2, Calendar,
  AlertCircle, RefreshCw, BookOpen,
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useCourse, useDeleteCourse } from '../hooks/useCourses';
import { useIsSuperAdmin, useIsAdmin } from '../hooks/usePermission';
import { useToast } from '../hooks/useToast';
import { CourseImage } from '../features/courses/components/CourseImage';
import { DeleteCourseDialog } from '../features/courses/components/DeleteCourseDialog';
import { ToastContainer } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { buildRoute, ROUTES } from '../utils/constants';
import { formatDate, getErrorMessage } from '../utils/format';

export function CourseDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);

  const isSuperAdmin = useIsSuperAdmin();
  const isAdmin = useIsAdmin();

  const { data: course, isLoading, isError, error, refetch } = useCourse(id);
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const { toasts, addToast, removeToast } = useToast();

  const handleDeleteConfirm = () => {
    if (!course) return;
    deleteCourse(course.id, {
      onSuccess: () => {
        addToast(`"${course.name}" deleted.`, 'success');
        setTimeout(() => navigate(ROUTES.COURSES), 600);
      },
      onError: (err) => {
        addToast(getErrorMessage(err), 'error');
        setShowDelete(false);
      },
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">

        {/* Breadcrumb */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.COURSES)}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft size={16} />
          Courses
        </button>

        {/* Loading */}
        {isLoading && (
          <div className="animate-pulse space-y-4 max-w-3xl">
            <div className="h-52 rounded-2xl bg-gray-200" />
            <div className="h-8 w-1/2 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-3/4 rounded bg-gray-100" />
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle size={32} className="text-red-400" />
            <div>
              <p className="font-semibold text-red-700">Failed to load course</p>
              <p className="mt-1 text-sm text-red-500">{getErrorMessage(error)}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={14} /> Try again
            </Button>
          </div>
        )}

        {/* Course content */}
        {!isLoading && !isError && course && (
          <div className="flex flex-col gap-6 max-w-4xl">

            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-2xl shadow-md">
              <CourseImage courseName={course.name} className="h-56 w-full" />
            </div>

            {/* Title + actions row */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    Created {formatDate(course.createdAt)}
                  </span>
                  {course.updatedAt !== course.createdAt && (
                    <span className="flex items-center gap-1.5">
                      Updated {formatDate(course.updatedAt)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(buildRoute.courseEdit(id))}
                  >
                    <Pencil size={14} /> Edit Course
                  </Button>
                )}
                {isSuperAdmin && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDelete(true)}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Description card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  About this course
                </h2>
              </div>
              {course.description ? (
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                  {course.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">No description provided.</p>
              )}
            </div>

            {/* Batches section placeholder */}
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-sm font-medium text-gray-500">
                Batch management for this course is coming in the next phase.
              </p>
            </div>
          </div>
        )}
      </div>

      <DeleteCourseDialog
        course={showDelete ? course ?? null : null}
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDelete(false)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
