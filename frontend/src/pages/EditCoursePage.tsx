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
  const { mutate: updateCourse, isPending, error: updateError, reset } = useUpdateCourse(id);

  const handleSubmit = (data: CourseFormValues) => {
    reset();
    updateCourse(
      {
        name:             data.name,
        description:      data.description      || undefined,
        bannerImage:      data.bannerImage      ?? null,
        whatYouWillLearn: data.whatYouWillLearn || undefined,
      },
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
      <div className="mx-auto max-w-[1200px] w-full px-6 py-6 lg:py-8">
        <button
          type="button"
          onClick={() => navigate(course ? buildRoute.courseDetail(id) : ROUTES.COURSES)}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft size={16} />
          {course ? `Back to ${course.name}` : 'Back to Courses'}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          {course && <p className="mt-1 text-sm text-gray-500">Editing: <span className="font-medium text-gray-700">{course.name}</span></p>}
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse space-y-5">
            {[...Array(4)].map((_, i) => <div key={i} className="h-11 rounded-lg bg-gray-100" />)}
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            Failed to load course: {getErrorMessage(fetchError)}
          </div>
        )}

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
