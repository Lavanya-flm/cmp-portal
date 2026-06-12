import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../errors/AppError';
import { ValidationErrorDetail } from '../errors/AppError';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * validate — Joi schema validation middleware factory.
 *
 * Usage:
 *   router.post('/', validate(createUserSchema), handler)
 *   router.get('/', validate(querySchema, 'query'), handler)
 */
export function validate(schema: Joi.ObjectSchema, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details: ValidationErrorDetail[] = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));

      return next(new ValidationError('Validation failed', details));
    }

    // Replace with sanitized/coerced value
    req[target] = value;
    next();
  };
}
