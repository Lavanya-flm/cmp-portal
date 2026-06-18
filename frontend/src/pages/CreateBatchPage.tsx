import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useCourse } from '../hooks/useCourses';
import { useCreateBatch } from '../hooks/useBatches';
import { useToast } from '../hooks/useToast';
import { BatchForm } from '../features/batches/components/BatchForm';
import { ToastContainer } from '../components/ui/Toast';
import { buildRoute, ROUTES } from '../utils/constants';
import type { BatchFormValues } from '../features/batches/batch.schema';

export function CreateBatchPage() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const { data: course } = useCourse(courseId);
  const { mutate: createBatch, isPending, error, reset } = useCreateBatch(courseId);

  const handleSubmit = (data: BatchFormValues) => {
    reset();
    createBatch(
      {
        batchMonthYear: data.batchMonthYear,
        batchName:      data.batchName,
        startDate:      data.startDate,
        endDate:        data.endDate || undefined,
        price:          data.price,
        supportEmail:   data.supportEmail,
        duration:       data.duration       || undefined,
        extraOffers:    data.extraOffers    || undefined,
        feedback1:      data.feedback1      ?? undefined,
        feedback2:      data.feedback2      ?? undefined,
        feedback3:      data.feedback3      ?? undefined,
        overallFeedback: data.overallFeedback ?? undefined,
        trainer: {
          name:           data.trainer.name,
          email:          data.trainer.email,
          phone:          data.trainer.phone || undefined,
          experience:     data.trainer.experience ?? undefined,
          currentCompany: data.trainer.currentCompany || undefined,
        },
        batchLinks: {
          syllabusLink:         data.batchLinks?.syllabusLink         || undefined,
          projectsLink:         data.batchLinks?.projectsLink         || undefined,
          trainerDemoRecording: data.batchLinks?.trainerDemoRecording || undefined,
          liveDemoRecording1:   data.batchLinks?.liveDemoRecording1   || undefined,
          liveDemoRecording2:   data.batchLinks?.liveDemoRecording2   || undefined,
          paymentLink:          data.batchLinks?.paymentLink          || undefined,
          whatsappGroupLink:    data.batchLinks?.whatsappGroupLink    || undefined,
          communityLink:        data.batchLinks?.communityLink        || undefined,
        },
      },
      {
        onSuccess: () => {
          addToast('Batch created successfully!', 'success');
          setTimeout(() => navigate(buildRoute.courseDetail(courseId)), 700);
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1200px] w-full px-6 py-6 lg:py-8">
        <button
          type="button"
          onClick={() => navigate(course ? buildRoute.courseDetail(courseId) : ROUTES.COURSES)}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft size={16} />
          {course ? `Back to ${course.name}` : 'Back to Courses'}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Batch</h1>
          {course && (
            <p className="mt-1 text-sm text-gray-500">
              Adding a new batch to <span className="font-medium text-gray-700">{course.name}</span>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <BatchForm
            isSubmitting={isPending}
            submitError={error}
            onSubmit={handleSubmit}
            onCancel={() => navigate(buildRoute.courseDetail(courseId))}
            submitLabel="Create Batch"
          />
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
