import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useBatch, useUpdateBatch } from '../hooks/useBatches';
import { useCourse } from '../hooks/useCourses';
import { useToast } from '../hooks/useToast';
import { BatchForm } from '../features/batches/components/BatchForm';
import { ToastContainer } from '../components/ui/Toast';
import { buildRoute } from '../utils/constants';
import { getErrorMessage } from '../utils/format';
import type { BatchFormValues } from '../features/batches/batch.schema';

export function EditBatchPage() {
  const { courseId = '', batchId = '' } = useParams<{ courseId: string; batchId: string }>();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const { data: course } = useCourse(courseId);
  const { data: batch, isLoading, isError, error: fetchError } = useBatch(batchId);
  const { mutate: updateBatch, isPending, error: updateError, reset } = useUpdateBatch(batchId, courseId);

  const handleSubmit = (data: BatchFormValues) => {
    reset();
    updateBatch(
      {
        batchMonthYear: data.batchMonthYear || undefined,
        batchName:      data.batchName,
        status:         data.status,
        startDate:      data.startDate,
        endDate:        data.endDate || undefined,
        price:          data.price,
        supportEmail:   data.supportEmail,
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
          addToast('Batch updated successfully!', 'success');
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
          onClick={() => navigate(buildRoute.courseDetail(courseId))}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft size={16} />
          {course ? course.name : 'Back to Course'}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Batch</h1>
          {batch && <p className="mt-1 text-sm text-gray-500">Editing: <span className="font-medium text-gray-700">{batch.batchName}</span></p>}
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse space-y-5">
            {[...Array(6)].map((_, i) => <div key={i} className="h-11 rounded-lg bg-gray-100" />)}
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            Failed to load batch: {getErrorMessage(fetchError)}
          </div>
        )}

        {!isLoading && !isError && batch && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <BatchForm
              defaultValues={batch}
              isSubmitting={isPending}
              submitError={updateError}
              onSubmit={handleSubmit}
              onCancel={() => navigate(buildRoute.courseDetail(courseId))}
              submitLabel="Save Changes"
              isEditMode
            />
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
