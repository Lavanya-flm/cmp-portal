import { z } from 'zod';

const urlOrEmpty = z
  .string()
  .optional()
  .transform((v) => v?.trim() || undefined)
  .refine((v) => !v || /^https?:\/\/.+/.test(v), {
    message: 'Please enter a valid URL (starting with https://)',
  });

const phoneOrEmpty = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine(
    (v) => !v || /^[6-9]\d{9}$/.test(v),
    (v) => ({
      message: !v
        ? ''
        : v.length !== 10
          ? 'Phone number must be exactly 10 digits'
          : 'Phone number must start with 6, 7, 8, or 9',
    }),
  );

// ─── Feedback rating — optional, 1–5, decimals allowed ───────────────────────
// Empty string / undefined / null all pass — ratings are collected later via Edit

const feedbackRating = z
  .union([z.literal(''), z.literal(null), z.undefined()])
  .transform(() => undefined)
  .or(
    z.coerce
      .number({ invalid_type_error: 'Must be a number between 1 and 5' })
      .min(1, 'Minimum rating is 1')
      .max(5, 'Maximum rating is 5'),
  )
  .optional()
  .nullable();

// ─── Trainer sub-schema ───────────────────────────────────────────────────────

const trainerSchema = z.object({
  name:           z.string().min(1, 'Trainer name is required').max(100),
  email:          z.string().min(1, 'Trainer email is required').email('Enter a valid email address'),
  phone:          phoneOrEmpty,
  experience:     z.coerce.number({ invalid_type_error: 'Must be a number' }).int().min(0).max(60).optional().nullable(),
  currentCompany: z.string().max(150).optional().or(z.literal('')),
});

// ─── Batch Links sub-schema ───────────────────────────────────────────────────

const batchLinksSchema = z.object({
  syllabusLink:         urlOrEmpty,
  projectsLink:         urlOrEmpty,
  trainerDemoRecording: urlOrEmpty,
  liveDemoRecording1:   urlOrEmpty,
  liveDemoRecording2:   urlOrEmpty,
  paymentLink:          urlOrEmpty,
  whatsappGroupLink:    urlOrEmpty,
  communityLink:        urlOrEmpty,
});

// ─── Full batch form schema ───────────────────────────────────────────────────
// status is intentionally omitted — derived automatically from dates

export const batchSchema = z.object({
  batchMonthYear: z
    .string()
    .min(1, 'Batch month & year is required')
    .max(100, 'Must not exceed 100 characters'),
  batchName:    z.string().min(1, 'Batch name is required').max(150),
  startDate:    z.string().min(1, 'Start date is required'),
  endDate:      z.string().optional().or(z.literal('')),
  price: z.coerce
    .number({ invalid_type_error: 'Price is required' })
    .min(0, 'Price must be 0 or more'),
  supportEmail: z
    .string()
    .min(1, 'Support email is required')
    .email('Enter a valid email address'),
  duration:    z.string().max(100).optional().or(z.literal('')),
  extraOffers: z.string().max(5000).optional().or(z.literal('')),
  feedback1:       feedbackRating,
  feedback2:       feedbackRating,
  feedback3:       feedbackRating,
  overallFeedback: feedbackRating,
  trainer:    trainerSchema,
  batchLinks: batchLinksSchema.optional(),
});

export type BatchFormValues = z.infer<typeof batchSchema>;
