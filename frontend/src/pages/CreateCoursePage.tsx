import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useCreateCourse } from '../hooks/useCourses';
import { CourseForm } from '../features/courses/components/CourseForm';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { ROUTES } from '../utils/constants';
import type { CourseFormValues } from '../features/courses/course.schema';

export function CreateCoursePage() {
  const navigate = useNavigate();
  const { mutate: createCourse, isPending, error, reset } = useCreateCourse();
  const { toasts, addToast, removeToast } = useToast();

  const handleSubmit = (data: CourseFormValues) => {
    reset();
    createCourse(
      { name: data.name, description: data.description || undefined },
      {
        onSuccess: () => {
          addToast('Course created successfully!', 'success');
          setTimeout(() => navigate(ROUTES.COURSES), 800);
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1200px] w-full px-6 py-6 lg:py-8">
        <button
          type="button"
          onClick={() => navigate(ROUTES.COURSES)}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Courses
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Course</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new course to the CMP Portal catalogue.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <CourseForm
            isSubmitting={isPending}
            submitError={error}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTES.COURSES)}
            submitLabel="Create Course"
          />
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
