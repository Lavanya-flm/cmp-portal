import Joi from 'joi';

// ─── Reusable sub-schemas ─────────────────────────────────────────────────────

const trainerCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Trainer name is required',
    'any.required': 'Trainer name is required',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    'string.email': 'Trainer email must be a valid email address',
    'any.required': 'Trainer email is required',
  }),
  phone: Joi.string().trim().max(20).optional().allow('', null),
  experience: Joi.number().integer().min(0).max(60).optional().allow(null).messages({
    'number.min': 'Experience must be 0 or more years',
    'number.max': 'Experience must be 60 years or less',
  }),
  currentCompany: Joi.string().trim().max(150).optional().allow('', null),
});

const trainerUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().optional(),
  phone: Joi.string().trim().max(20).optional().allow('', null),
  experience: Joi.number().integer().min(0).max(60).optional().allow(null),
  currentCompany: Joi.string().trim().max(150).optional().allow('', null),
});

const batchLinksSchema = Joi.object({
  syllabusLink:         Joi.string().uri().max(500).optional().allow('', null),
  projectsLink:         Joi.string().uri().max(500).optional().allow('', null),
  trainerDemoRecording: Joi.string().uri().max(500).optional().allow('', null),
  liveDemoRecording1:   Joi.string().uri().max(500).optional().allow('', null),
  liveDemoRecording2:   Joi.string().uri().max(500).optional().allow('', null),
  paymentLink:          Joi.string().uri().max(500).optional().allow('', null),
  whatsappGroupLink:    Joi.string().uri().max(500).optional().allow('', null),
  communityLink:        Joi.string().uri().max(500).optional().allow('', null),
});

// ─── Create Batch ─────────────────────────────────────────────────────────────

export const createBatchSchema = Joi.object({
  batchNumber: Joi.number().integer().min(1).required().messages({
    'number.base': 'Batch number must be a number',
    'number.min': 'Batch number must be at least 1',
    'any.required': 'Batch number is required',
  }),
  batchMonthYear: Joi.string().trim().max(100).optional().allow('', null),
  batchName: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Batch name is required',
    'any.required': 'Batch name is required',
  }),
  status: Joi.string().valid('Upcoming', 'Live', 'Completed').default('Upcoming').messages({
    'any.only': 'Status must be one of: Upcoming, Live, Completed',
  }),
  startDate: Joi.string()
    .isoDate()
    .required()
    .messages({
      'string.isoDate': 'Start date must be a valid ISO date (YYYY-MM-DD)',
      'any.required': 'Start date is required',
    }),
  endDate: Joi.string().isoDate().optional().allow('', null).messages({
    'string.isoDate': 'End date must be a valid ISO date (YYYY-MM-DD)',
  }),
  price: Joi.number().min(0).precision(2).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be 0 or more',
    'any.required': 'Price is required',
  }),
  supportEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Support email must be a valid email address',
      'any.required': 'Support email is required',
    }),
  trainer: trainerCreateSchema.required().messages({
    'any.required': 'Trainer information is required',
  }),
  batchLinks: batchLinksSchema.optional(),
});

// ─── Update Batch ─────────────────────────────────────────────────────────────

export const updateBatchSchema = Joi.object({
  batchName:      Joi.string().trim().min(2).max(150).optional(),
  batchMonthYear: Joi.string().trim().max(100).optional().allow('', null),
  status: Joi.string().valid('Upcoming', 'Live', 'Completed').optional().messages({
    'any.only': 'Status must be one of: Upcoming, Live, Completed',
  }),
  startDate: Joi.string().isoDate().optional().allow(null).messages({
    'string.isoDate': 'Start date must be a valid ISO date (YYYY-MM-DD)',
  }),
  endDate: Joi.string().isoDate().optional().allow('', null).messages({
    'string.isoDate': 'End date must be a valid ISO date (YYYY-MM-DD)',
  }),
  price: Joi.number().min(0).precision(2).optional(),
  supportEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .optional(),
  trainer: trainerUpdateSchema.optional(),
  batchLinks: batchLinksSchema.optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// ─── List query ───────────────────────────────────────────────────────────────

export const batchQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('batchNumber', 'startDate', 'createdAt').default('batchNumber'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

// ─── Params ───────────────────────────────────────────────────────────────────

export const batchIdParamSchema = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'Batch ID must be a valid UUID',
    'any.required': 'Batch ID is required',
  }),
});

export const courseIdParamSchema = Joi.object({
  courseId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'Course ID must be a valid UUID',
    'any.required': 'Course ID is required',
  }),
});
