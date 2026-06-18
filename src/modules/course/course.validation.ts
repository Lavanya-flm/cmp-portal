import Joi from 'joi';

export const createCourseSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Course name is required',
    'string.min':   'Course name must be at least 2 characters',
    'string.max':   'Course name must not exceed 150 characters',
    'any.required': 'Course name is required',
  }),
  description: Joi.string().trim().max(2000).optional().allow('', null),
  status: Joi.string().valid('Upcoming', 'Live', 'Completed').default('Upcoming'),
  bannerImage:      Joi.string().optional().allow('', null),
  whatYouWillLearn: Joi.string().trim().max(5000).optional().allow('', null).messages({
    'string.max': 'What You Will Learn must not exceed 5000 characters',
  }),
});

export const updateCourseSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional().messages({
    'string.empty': 'Course name cannot be empty',
    'string.min':   'Course name must be at least 2 characters',
    'string.max':   'Course name must not exceed 150 characters',
  }),
  description:      Joi.string().trim().max(2000).optional().allow('', null),
  status:           Joi.string().valid('Upcoming', 'Live', 'Completed').optional(),
  bannerImage:      Joi.string().optional().allow('', null),
  whatYouWillLearn: Joi.string().trim().max(5000).optional().allow('', null).messages({
    'string.max': 'What You Will Learn must not exceed 5000 characters',
  }),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });

export const courseQuerySchema = Joi.object({
  page:      Joi.number().integer().min(1).default(1),
  limit:     Joi.number().integer().min(1).max(100).default(10),
  search:    Joi.string().trim().max(100).optional().allow(''),
  sortBy:    Joi.string().valid('name', 'createdAt', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export const courseIdParamSchema = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'Course ID must be a valid UUID',
    'any.required': 'Course ID is required',
  }),
});
