import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useCourse, useUpdateCourse } from '../hooks/useCourses';
import { CourseForm } from '../features/courses/components/CourseForm';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { buildRoute, ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/format';
import type { CourseFormValues } from '../features/courses/course.schema';

export function EditCoursePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const { data: course, isLoading, isError, error: fetchError } = useCourse(id);
  const {
    mutate: updateCourse,
    isPending,
    error: updateError,
    reset,
  } = useUpdateCourse(id);

  const handleSubmit = (data: CourseFormValues) => {
    reset();
    updateCourse(
      { name: data.name, description: data.description || undefined },
      {
        onSuccess: () => {
          addToast('Course updated successfully!', 'success');
          setTimeout(() => navigate(buildRoute.courseDetail(id)), 800);
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl p-6 lg:p-8">

        {/* Breadcrumb */}
        <button
          type="button"
          onClick={() => navigate(course ? buildRoute.courseDetail(id) : ROUTES.COURSES)}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft size={16} />
          {course ? `Back to ${course.name}` : 'Back to Courses'}
        </button>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          {course && (
            <p className="mt-1 text-sm text-gray-500">
              Editing: <span className="font-medium text-gray-700">{course.name}</span>
            </p>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
            <div className="flex flex-col gap-4">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-10 rounded-lg bg-gray-100" />
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-28 rounded-lg bg-gray-100" />
              <div className="flex justify-end gap-3">
                <div className="h-10 w-24 rounded-lg bg-gray-100" />
                <div className="h-10 w-28 rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
        )}

        {/* Fetch error */}
        {isError && !isLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p>Failed to load course: {getErrorMessage(fetchError)}</p>
          </div>
        )}

        {/* Form card */}
        {!isLoading && !isError && course && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <CourseForm
              defaultValues={course}
              isSubmitting={isPending}
              submitError={updateError}
              onSubmit={handleSubmit}
              onCancel={() => navigate(buildRoute.courseDetail(id))}
              submitLabel="Save Changes"
            />
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
