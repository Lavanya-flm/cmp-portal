import { z } from 'zod';

const urlOrEmpty = z
  .string()
  .optional()
  .transform((v) => v?.trim() || undefined)   // treat whitespace-only as empty
  .refine((v) => !v || /^https?:\/\/.+/.test(v), {
    message: 'Please enter a valid URL (starting with https://)',
  });

// ─── Trainer sub-schema ───────────────────────────────────────────────────────

const trainerSchema = z.object({
  name:           z.string().min(1, 'Trainer name is required').max(100),
  email:          z.string().min(1, 'Trainer email is required').email('Enter a valid email address'),
  phone:          z.string().max(20).optional().or(z.literal('')),
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

// ─── Allowed batch statuses ───────────────────────────────────────────────────
export const BATCH_STATUSES = ['Upcoming', 'Live', 'Completed'] as const;
export type BatchStatusOption = typeof BATCH_STATUSES[number];

// ─── Full batch form schema ───────────────────────────────────────────────────

export const batchSchema = z.object({
  batchMonthYear: z
    .string()
    .min(1, 'Batch month & year is required')
    .max(100, 'Must not exceed 100 characters'),
  batchName: z.string().min(1, 'Batch name is required').max(150),
  status: z.enum(BATCH_STATUSES, {
    required_error: 'Status is required',
    invalid_type_error: 'Select a valid status',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate:   z.string().optional().or(z.literal('')),
  price: z.coerce
    .number({ invalid_type_error: 'Price is required' })
    .min(0, 'Price must be 0 or more'),
  supportEmail: z
    .string()
    .min(1, 'Support email is required')
    .email('Enter a valid email address'),
  trainer:    trainerSchema,
  batchLinks: batchLinksSchema.optional(),
});

export type BatchFormValues = z.infer<typeof batchSchema>;
