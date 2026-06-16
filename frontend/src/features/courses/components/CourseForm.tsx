import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { ErrorBanner } from '../../../components/auth/ErrorBanner';
import { courseSchema, CourseFormValues } from '../course.schema';
import { CourseImage } from './CourseImage';
import { getErrorMessage } from '../../../utils/format';
import type { Course } from '../../../types';

interface CourseFormProps {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name:         defaultValues?.name         ?? '',
      description:  defaultValues?.description  ?? '',
      courseOffers: defaultValues?.courseOffers ?? '',
      bannerImage:  defaultValues?.bannerImage  ?? null,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name:         defaultValues.name         ?? '',
        description:  defaultValues.description  ?? '',
        courseOffers: defaultValues.courseOffers ?? '',
        bannerImage:  defaultValues.bannerImage  ?? null,
      });
    }
  }, [defaultValues, reset]);

  const bannerImage = watch('bannerImage');
  const serverError = submitError ? getErrorMessage(submitError) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setValue('bannerImage', ev.target?.result as string, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {serverError && <ErrorBanner message={serverError} />}

      {/* ── Course Name ───────────────────────────────────────────────── */}
      <Input
        label="Course Name *"
        placeholder="Course Name"
        error={errors.name?.message}
        autoFocus
        {...register('name')}
      />

      {/* ── Banner Upload ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Course Banner</label>

        {bannerImage ? (
          <div className="relative overflow-hidden rounded-xl border border-gray-200">
            <CourseImage courseName={watch('name') || 'Course'} imageUrl={bannerImage} className="h-44 w-full" />
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-7 items-center gap-1 rounded-lg bg-white/90 px-2.5 text-xs font-medium text-gray-700 shadow backdrop-blur-sm hover:bg-white transition-colors"
              >
                <Upload size={12} /> Replace
              </button>
              <button
                type="button"
                onClick={() => setValue('bannerImage', null, { shouldDirty: true })}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-red-500 shadow backdrop-blur-sm hover:bg-white transition-colors"
                aria-label="Remove banner"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-amber-400 hover:bg-amber-50/30 hover:text-amber-500 transition-all"
          >
            <Upload size={22} />
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload banner</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP · Recommended 16:9</p>
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <Controller name="bannerImage" control={control} render={() => <></>} />
      </div>

      {/* ── Description ───────────────────────────────────────────────── */}
      <Textarea
        label="Description"
        placeholder="Describe what students will learn"
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* ── Course Offers ─────────────────────────────────────────────── */}
      <Textarea
        label="Course Offers"
        placeholder="One item per line"
        rows={5}
        error={errors.courseOffers?.message}
        {...register('courseOffers')}
      />

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
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
