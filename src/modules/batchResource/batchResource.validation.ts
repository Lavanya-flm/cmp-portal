import Joi from 'joi';

const VALID_RESOURCE_TYPES = [
  'SYLLABUS',
  'PROJECT_DOCUMENT',
  'ASSIGNMENT',
  'INTERVIEW_QUESTION',
  'PPT',
  'NOTE',
  'CHEAT_SHEET',
  'PLACEMENT_MATERIAL',
];

export const createBatchResourceSchema = Joi.object({
  resourceType: Joi.string()
    .valid(...VALID_RESOURCE_TYPES)
    .required()
    .messages({
      'any.only':    `Resource type must be one of: ${VALID_RESOURCE_TYPES.join(', ')}`,
      'any.required': 'Resource type is required',
    }),
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required',
  }),
  description: Joi.string().trim().max(1000).optional().allow('', null),
  fileName:    Joi.string().trim().min(1).max(255).required(),
  fileUrl:     Joi.string().trim().min(1).required(),
  fileSize:    Joi.number().integer().min(0).optional().allow(null),
  mimeType:    Joi.string().trim().max(100).optional().allow('', null),
});

export const batchResourceIdParamSchema = Joi.object({
  batchId:     Joi.string().uuid().required(),
  resourceId:  Joi.string().uuid().required(),
});

export const batchIdParamSchemaRes = Joi.object({
  batchId: Joi.string().uuid().required(),
});
