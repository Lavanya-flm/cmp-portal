import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ErrorBanner } from '../../../components/auth/ErrorBanner';
import { batchSchema, BatchFormValues, BATCH_STATUSES } from '../batch.schema';
import { getErrorMessage } from '../../../utils/format';
import type { Batch } from '../../../types';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{children}</h3>
    </div>
  );
}

function ThreeCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

interface BatchFormProps {
  defaultValues?: Partial<Batch>;
  isSubmitting: boolean;
  submitError: unknown;
  onSubmit: (data: BatchFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  isEditMode?: boolean;
}

export function BatchForm({
  defaultValues,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
  submitLabel = 'Save Batch',
  isEditMode = false,
}: BatchFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: buildDefaults(defaultValues),
  });

  useEffect(() => {
    if (defaultValues) reset(buildDefaults(defaultValues));
  }, [defaultValues, reset]);

  const serverError = submitError ? getErrorMessage(submitError) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      {serverError && <ErrorBanner message={serverError} />}

      {/* ── Batch Information ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <SectionTitle>Batch Information</SectionTitle>
        <TwoCol>
          <Input
            label="Batch Name *"
            placeholder="Name"
            error={errors.batchName?.message}
            {...register('batchName')}
          />
          <Input
            label="Support Email *"
            type="email"
            placeholder="Email"
            error={errors.supportEmail?.message}
            {...register('supportEmail')}
          />
        </TwoCol>
        <TwoCol>
          {/* Status dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Status *</label>
            <div className="relative">
              <select
                {...register('status')}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-3.5 pr-8 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-gray-400 transition-colors"
              >
                {BATCH_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.status && <p className="text-xs font-medium text-red-500">{errors.status.message}</p>}
          </div>

          <Input
            label="Batch Month & Year *"
            placeholder="July 2026"
            error={errors.batchMonthYear?.message}
            {...register('batchMonthYear')}
          />
        </TwoCol>
        <ThreeCol>
          <Input
            label="Start Date *"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
          <Input
            label="Price (₹) *"
            type="number"
            min={0}
            step={0.01}
            placeholder="Price"
            error={errors.price?.message}
            {...register('price')}
          />
        </ThreeCol>
      </div>

      {/* ── Trainer Details ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <SectionTitle>Trainer Details</SectionTitle>
        <ThreeCol>
          <Input
            label="Trainer Name *"
            placeholder="Name"
            error={errors.trainer?.name?.message}
            {...register('trainer.name')}
          />
          <Input
            label="Trainer Email *"
            type="email"
            placeholder="Email"
            error={errors.trainer?.email?.message}
            {...register('trainer.email')}
          />
          <Input
            label="Phone Number"
            placeholder="Number"
            error={errors.trainer?.phone?.message}
            {...register('trainer.phone')}
          />
        </ThreeCol>
        <TwoCol>
          <Input
            label="Experience (Years)"
            type="number"
            min={0}
            max={60}
            placeholder="Experience"
            error={errors.trainer?.experience?.message}
            {...register('trainer.experience')}
          />
          <Input
            label="Current Company"
            placeholder="Company"
            error={errors.trainer?.currentCompany?.message}
            {...register('trainer.currentCompany')}
          />
        </TwoCol>
      </div>

      {/* ── Resource Links ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <SectionTitle>Resource Links</SectionTitle>
        <TwoCol>
          <Input label="Syllabus Link"          type="url" placeholder="https://"
            error={errors.batchLinks?.syllabusLink?.message}         {...register('batchLinks.syllabusLink')} />
          <Input label="Projects Link"          type="url" placeholder="https://"
            error={errors.batchLinks?.projectsLink?.message}         {...register('batchLinks.projectsLink')} />
        </TwoCol>
        <TwoCol>
          <Input label="Trainer Demo Recording" type="url" placeholder="https://"
            error={errors.batchLinks?.trainerDemoRecording?.message} {...register('batchLinks.trainerDemoRecording')} />
          <Input label="Community Link"         type="url" placeholder="https://"
            error={errors.batchLinks?.communityLink?.message}        {...register('batchLinks.communityLink')} />
        </TwoCol>
        <TwoCol>
          <Input label="Live Demo Recording 1"  type="url" placeholder="https://"
            error={errors.batchLinks?.liveDemoRecording1?.message}   {...register('batchLinks.liveDemoRecording1')} />
          <Input label="Live Demo Recording 2"  type="url" placeholder="https://"
            error={errors.batchLinks?.liveDemoRecording2?.message}   {...register('batchLinks.liveDemoRecording2')} />
        </TwoCol>
        <TwoCol>
          <Input label="Payment Link"           type="url" placeholder="https://"
            error={errors.batchLinks?.paymentLink?.message}          {...register('batchLinks.paymentLink')} />
          <Input label="WhatsApp Group Link"    type="url" placeholder="https://"
            error={errors.batchLinks?.whatsappGroupLink?.message}    {...register('batchLinks.whatsappGroupLink')} />
        </TwoCol>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={!isDirty && isEditMode}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ─── Default values builder ───────────────────────────────────────────────────

function buildDefaults(batch?: Partial<Batch>): Partial<BatchFormValues> {
  if (!batch) return {};
  return {
    batchMonthYear: batch.batchMonthYear ?? '',
    batchName:      batch.batchName      ?? '',
    status:         (batch.status as BatchFormValues['status']) ?? 'Upcoming',
    startDate:      batch.startDate ? batch.startDate.split('T')[0] : '',
    endDate:        batch.endDate   ? batch.endDate.split('T')[0]   : '',
    price:          batch.price,
    supportEmail:   batch.supportEmail ?? '',
    trainer: {
      name:           batch.trainer?.name           ?? '',
      email:          batch.trainer?.email          ?? '',
      phone:          batch.trainer?.phone          ?? '',
      experience:     batch.trainer?.experience     ?? undefined,
      currentCompany: batch.trainer?.currentCompany ?? '',
    },
    batchLinks: {
      syllabusLink:         batch.batchLinks?.syllabusLink         ?? '',
      projectsLink:         batch.batchLinks?.projectsLink         ?? '',
      trainerDemoRecording: batch.batchLinks?.trainerDemoRecording ?? '',
      liveDemoRecording1:   batch.batchLinks?.liveDemoRecording1   ?? '',
      liveDemoRecording2:   batch.batchLinks?.liveDemoRecording2   ?? '',
      paymentLink:          batch.batchLinks?.paymentLink          ?? '',
      whatsappGroupLink:    batch.batchLinks?.whatsappGroupLink    ?? '',
      communityLink:        batch.batchLinks?.communityLink        ?? '',
    },
  };
}
