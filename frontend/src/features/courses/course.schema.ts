import { z } from 'zod';

export const courseSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .min(2, 'Course name must be at least 2 characters')
    .max(150, 'Course name must not exceed 150 characters'),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
