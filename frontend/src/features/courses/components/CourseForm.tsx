import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { ErrorBanner } from '../../../components/auth/ErrorBanner';
import { courseSchema, CourseFormValues } from '../course.schema';
import { getErrorMessage } from '../../../utils/format';
import type { Course } from '../../../types';

interface CourseFormProps {
  /** Pre-fill for edit mode */
  defaultValues?: Partial<Course>;
  isSubmitting: boolean;
  submitError: unknown;
  onSubmit: (data: CourseFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function CourseForm({
  defaultValues,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
  submitLabel = 'Save Course',
}: CourseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
    },
  });

  // Re-populate form when defaultValues change (edit mode navigation)
  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? '',
        description: defaultValues.description ?? '',
      });
    }
  }, [defaultValues, reset]);

  const serverError = submitError ? getErrorMessage(submitError) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {serverError && <ErrorBanner message={serverError} />}

      <Input
        label="Course Name"
        placeholder="e.g. Data Analytics - Apr 2026"
        error={errors.name?.message}
        autoFocus
        {...register('name')}
      />

      <Textarea
        label="Description"
        placeholder="Describe what students will learn…"
        rows={5}
        error={errors.description?.message}
        hint="Optional — displayed under the course name on cards."
        {...register('description')}
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={!isDirty && Boolean(defaultValues)}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
