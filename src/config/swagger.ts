import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CMP API',
      version: '1.0.0',
      description: 'CMP Backend REST API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@cmp.io',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}${env.apiPrefix}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
            },
          },
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Something went wrong' },
            code: { type: 'string', example: 'BAD_REQUEST' },
            requestId: { type: 'string', example: 'uuid-v4' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 422 },
            message: { type: 'string', example: 'Validation failed' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'integer', example: 200 },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        RolePermissions: {
          type: 'object',
          description: 'Role-based access control summary',
          properties: {
            SUPER_ADMIN: {
              type: 'array',
              description: 'Full access — create, edit, delete, view on all modules',
              items: { type: 'string' },
              example: ['course:create', 'course:read', 'course:update', 'course:delete',
                        'batch:create', 'batch:read', 'batch:update', 'batch:delete',
                        'trainer:create', 'trainer:read', 'trainer:update', 'trainer:delete',
                        'links:create', 'links:read', 'links:update', 'links:delete'],
            },
            SUB_ADMIN: {
              type: 'array',
              description: 'Restricted access — create, edit, view only. No delete.',
              items: { type: 'string' },
              example: ['course:create', 'course:read', 'course:update',
                        'batch:create', 'batch:read', 'batch:update',
                        'trainer:create', 'trainer:read', 'trainer:update',
                        'links:create', 'links:read', 'links:update'],
            },
            USER: {
              type: 'array',
              description: 'View only — no create, update, or delete on any module.',
              items: { type: 'string' },
              example: ['course:read', 'batch:read', 'trainer:read', 'links:read'],
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health',   description: 'Health check endpoints' },
      {
        name: 'Auth',
        description: 'Authentication — login, token refresh, logout.\n\n' +
          '**Roles:** `SUPER_ADMIN` · `SUB_ADMIN` · `USER`',
      },
      {
        name: 'Courses',
        description: 'Course management.\n\n' +
          '| Operation | Allowed roles |\n' +
          '|-----------|---------------|\n' +
          '| Create / Edit | `SUPER_ADMIN`, `SUB_ADMIN` |\n' +
          '| Delete | `SUPER_ADMIN` only |\n' +
          '| View | All authenticated users |',
      },
      {
        name: 'Batches',
        description: 'Batch management — trainer and resource links included.\n\n' +
          '| Operation | Allowed roles |\n' +
          '|-----------|---------------|\n' +
          '| Create / Edit | `SUPER_ADMIN`, `SUB_ADMIN` |\n' +
          '| Delete | `SUPER_ADMIN` only |\n' +
          '| View | All authenticated users |',
      },
      {
        name: 'Users',
        description: 'User management and self-service profile endpoints.\n\n' +
          '| Operation | Allowed roles |\n' +
          '|-----------|---------------|\n' +
          '| Create / Delete / Change Role | `SUPER_ADMIN` only |\n' +
          '| Update user (admin) | `SUPER_ADMIN` only |\n' +
          '| List / View any user | `SUPER_ADMIN`, `SUB_ADMIN` |\n' +
          '| View own profile / Update own profile / Change password | All authenticated |',
      },
    ],
  },
  apis: [
    './src/routes/**/*.ts',          // health + route registry
    './src/modules/**/*.routes.ts',  // all module route files (course, batch, auth, …)
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
