import { z } from 'zod';

const urlOrEmpty = z
  .string()
  .optional()
  .refine((v) => !v || v === '' || /^https?:\/\/.+/.test(v), {
    message: 'Must be a valid URL starting with http:// or https://',
  })
  .transform((v) => v || undefined);

// ─── Trainer sub-schema ───────────────────────────────────────────────────────

const trainerSchema = z.object({
  name: z.string().min(1, 'Trainer name is required').max(100),
  email: z
    .string()
    .min(1, 'Trainer email is required')
    .email('Enter a valid email address'),
  phone: z.string().max(20).optional().or(z.literal('')),
  experience: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .int()
    .min(0)
    .max(60)
    .optional()
    .nullable(),
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
});

// ─── Full batch form schema ───────────────────────────────────────────────────

export const batchSchema = z.object({
  batchNumber: z.coerce
    .number({ invalid_type_error: 'Batch number is required' })
    .int()
    .min(1, 'Batch number must be at least 1'),
  batchName: z.string().min(1, 'Batch name is required').max(150),
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
