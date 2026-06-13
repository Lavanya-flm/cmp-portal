import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ErrorBanner } from '../../../components/auth/ErrorBanner';
import { batchSchema, BatchFormValues } from '../batch.schema';
import { getErrorMessage } from '../../../utils/format';
import type { Batch } from '../../../types';

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{children}</h3>
    </div>
  );
}

// ─── 2-col row ────────────────────────────────────────────────────────────────

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BatchFormProps {
  defaultValues?: Partial<Batch>;
  isSubmitting: boolean;
  submitError: unknown;
  onSubmit: (data: BatchFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  isEditMode?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

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
        <Row>
          <Input
            label="Batch Number"
            type="number"
            min={1}
            placeholder="Batch Number"
            error={errors.batchNumber?.message}
            disabled={isEditMode}
            hint={isEditMode ? 'Cannot be changed after creation.' : undefined}
            {...register('batchNumber')}
          />
          <Input
            label="Batch Name"
            placeholder="Batch Name"
            error={errors.batchName?.message}
            {...register('batchName')}
          />
          <Input
            label="Support Email"
            type="email"
            placeholder="Support Email"
            error={errors.supportEmail?.message}
            {...register('supportEmail')}
          />
        </Row>
        <Row>
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            hint="Optional"
            {...register('endDate')}
          />
          <Input
            label="Price (₹)"
            type="number"
            min={0}
            step={0.01}
            placeholder="Price"
            error={errors.price?.message}
            {...register('price')}
          />
        </Row>
      </div>

      {/* ── Trainer Details ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <SectionTitle>Trainer Details</SectionTitle>
        <Row>
          <Input
            label="Trainer Name"
            placeholder="Trainer Name"
            error={errors.trainer?.name?.message}
            {...register('trainer.name')}
          />
          <Input
            label="Trainer Email"
            type="email"
            placeholder="Trainer Email"
            error={errors.trainer?.email?.message}
            {...register('trainer.email')}
          />
          <Input
            label="Phone Number"
            placeholder="Phone Number"
            error={errors.trainer?.phone?.message}
            hint="Optional"
            {...register('trainer.phone')}
          />
        </Row>
        <TwoCol>
          <Input
            label="Experience (Years)"
            type="number"
            min={0}
            max={60}
            placeholder="Experience (Years)"
            error={errors.trainer?.experience?.message}
            hint="Optional"
            {...register('trainer.experience')}
          />
          <Input
            label="Current Company"
            placeholder="Current Company"
            error={errors.trainer?.currentCompany?.message}
            hint="Optional"
            {...register('trainer.currentCompany')}
          />
        </TwoCol>
      </div>

      {/* ── Resource Links ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <SectionTitle>Resource Links (Optional)</SectionTitle>
        <Row>
          <Input label="Syllabus Link"           type="url" placeholder="Syllabus Link"           error={errors.batchLinks?.syllabusLink?.message}         {...register('batchLinks.syllabusLink')} />
          <Input label="Projects Link"           type="url" placeholder="Projects Link"           error={errors.batchLinks?.projectsLink?.message}         {...register('batchLinks.projectsLink')} />
          <Input label="Trainer Demo Recording"  type="url" placeholder="Trainer Demo Recording"  error={errors.batchLinks?.trainerDemoRecording?.message} {...register('batchLinks.trainerDemoRecording')} />
        </Row>
        <Row>
          <Input label="Live Demo Recording 1"   type="url" placeholder="Live Demo Recording 1"   error={errors.batchLinks?.liveDemoRecording1?.message}   {...register('batchLinks.liveDemoRecording1')} />
          <Input label="Live Demo Recording 2"   type="url" placeholder="Live Demo Recording 2"   error={errors.batchLinks?.liveDemoRecording2?.message}   {...register('batchLinks.liveDemoRecording2')} />
          <Input label="Payment Link"            type="url" placeholder="Payment Link"            error={errors.batchLinks?.paymentLink?.message}          {...register('batchLinks.paymentLink')} />
        </Row>
        <TwoCol>
          <Input label="WhatsApp Group Link"     type="url" placeholder="WhatsApp Group Link"     error={errors.batchLinks?.whatsappGroupLink?.message}    {...register('batchLinks.whatsappGroupLink')} />
        </TwoCol>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" loading={isSubmitting} disabled={!isDirty && isEditMode}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaults(batch?: Partial<Batch>): Partial<BatchFormValues> {
  if (!batch) return {};
  return {
    batchNumber:  batch.batchNumber,
    batchName:    batch.batchName ?? '',
    startDate:    batch.startDate ? batch.startDate.split('T')[0] : '',
    endDate:      batch.endDate ? batch.endDate.split('T')[0] : '',
    price:        batch.price,
    supportEmail: batch.supportEmail ?? '',
    trainer: {
      name:           batch.trainer?.name ?? '',
      email:          batch.trainer?.email ?? '',
      phone:          batch.trainer?.phone ?? '',
      experience:     batch.trainer?.experience ?? undefined,
      currentCompany: batch.trainer?.currentCompany ?? '',
    },
    batchLinks: {
      syllabusLink:         batch.batchLinks?.syllabusLink ?? '',
      projectsLink:         batch.batchLinks?.projectsLink ?? '',
      trainerDemoRecording: batch.batchLinks?.trainerDemoRecording ?? '',
      liveDemoRecording1:   batch.batchLinks?.liveDemoRecording1 ?? '',
      liveDemoRecording2:   batch.batchLinks?.liveDemoRecording2 ?? '',
      paymentLink:          batch.batchLinks?.paymentLink ?? '',
      whatsappGroupLink:    batch.batchLinks?.whatsappGroupLink ?? '',
    },
  };
}
