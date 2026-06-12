import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../core/middleware/validate.middleware';
import { authenticate } from '../../core/middleware/auth.middleware';
import { requireRole, requireOwnerOrRole } from '../../core/middleware/rbac.middleware';
import { Role } from '../../core/types';
import {
  createUserSchema,
  updateUserSchema,
  updateMyProfileSchema,
  changeRoleSchema,
  changePasswordSchema,
  userQuerySchema,
  userIdParamSchema,
} from './user.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: |
 *     User management and self-service profile endpoints.
 *
 *     | Operation | Allowed roles |
 *     |-----------|---------------|
 *     | Create / Delete / Change Role | `SUPER_ADMIN` only |
 *     | Update user (admin) | `SUPER_ADMIN` only |
 *     | List / View any user | `SUPER_ADMIN`, `SUB_ADMIN` |
 *     | View own profile / Update own profile / Change password | All authenticated |
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         email:
 *           type: string
 *           format: email
 *           example: john@cmp.io
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         role:
 *           type: string
 *           enum: [SUPER_ADMIN, SUB_ADMIN, USER]
 *           example: USER
 *         isActive:
 *           type: boolean
 *           example: true
 *         isEmailVerified:
 *           type: boolean
 *           example: false
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateUserRequest:
 *       type: object
 *       required: [email, password, firstName, lastName, role]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: newuser@cmp.io
 *         password:
 *           type: string
 *           format: password
 *           description: Min 8 chars, must include uppercase, lowercase, number, and special char
 *           example: Password@123
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         role:
 *           type: string
 *           enum: [SUPER_ADMIN, SUB_ADMIN, USER]
 *           example: USER
 *
 *     UpdateUserRequest:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         firstName:
 *           type: string
 *           example: Johnny
 *         lastName:
 *           type: string
 *           example: Doe
 *         isActive:
 *           type: boolean
 *           example: false
 *
 *     UpdateMyProfileRequest:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         firstName:
 *           type: string
 *           example: Johnny
 *         lastName:
 *           type: string
 *           example: Doe
 *
 *     ChangeRoleRequest:
 *       type: object
 *       required: [role]
 *       properties:
 *         role:
 *           type: string
 *           enum: [SUPER_ADMIN, SUB_ADMIN, USER]
 *           example: SUB_ADMIN
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required: [currentPassword, newPassword]
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           example: OldPassword@123
 *         newPassword:
 *           type: string
 *           format: password
 *           description: Min 8 chars, must include uppercase, lowercase, number, and special char
 *           example: NewPassword@456
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SELF-SERVICE ROUTES  — /users/me  (must be before /:id to avoid param clash)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get my profile
 *     description: Returns the profile of the currently authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authenticate, userController.getMe);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update my profile
 *     description: Update own firstName and/or lastName. Email and password cannot be changed here.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMyProfileRequest'
 *           example:
 *             firstName: Johnny
 *             lastName: Doe
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/me', authenticate, validate(updateMyProfileSchema), userController.updateMe);

/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: Change my password
 *     description: |
 *       Verifies the current password then updates to the new one.
 *       All active sessions and refresh tokens are **revoked immediately** —
 *       the user must log in again with the new password.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           example:
 *             currentPassword: OldPassword@123
 *             newPassword: NewPassword@456
 *     responses:
 *       200:
 *         description: Password changed successfully — all sessions revoked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Current password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.patch(
  '/me/password',
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword,
);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES  — /users  and  /users/:id
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: |
 *       Creates a new user account. Password is hashed before storage.
 *       `passwordHash` is never returned in any response.
 *       **Requires SUPER_ADMIN role.**
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *           example:
 *             email: newuser@cmp.io
 *             password: Password@123
 *             firstName: John
 *             lastName: Doe
 *             role: USER
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  validate(createUserSchema),
  userController.create,
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users (paginated)
 *     description: |
 *       Returns a paginated list of users. Supports search across email, firstName, and lastName.
 *       **Requires SUPER_ADMIN or SUB_ADMIN role.**
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search across email, firstName, lastName
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [firstName, lastName, email, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     statusCode:
 *                       type: integer
 *                       example: 200
 *                     message:
 *                       type: string
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/',
  authenticate,
  requireRole(Role.SUPER_ADMIN, Role.SUB_ADMIN),
  validate(userQuerySchema, 'query'),
  userController.findAll,
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: |
 *       - `SUPER_ADMIN` and `SUB_ADMIN` can retrieve any user.
 *       - `USER` can only retrieve their own profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       403:
 *         description: USER role attempting to access another user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/:id',
  authenticate,
  validate(userIdParamSchema, 'params'),
  requireOwnerOrRole('id', Role.SUPER_ADMIN, Role.SUB_ADMIN),
  userController.findOne,
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     description: |
 *       Update firstName, lastName, or isActive status.
 *       Email and password cannot be changed via this endpoint.
 *       **Requires SUPER_ADMIN role.**
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           example:
 *             firstName: Johnny
 *             isActive: false
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put(
  '/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema),
  userController.update,
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: |
 *       Permanently deletes a user account. **Requires SUPER_ADMIN role.**
 *
 *       **Protected rules (returns 403):**
 *       - Cannot delete your own account
 *       - Cannot delete the system seed `superadmin@cmp.io`
 *       - Cannot delete the last remaining SUPER_ADMIN
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Self-delete / last SUPER_ADMIN / seed account protection
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  '/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  validate(userIdParamSchema, 'params'),
  userController.remove,
);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Change a user's role
 *     description: |
 *       Assigns a new role to a user. **Requires SUPER_ADMIN role.**
 *
 *       **Protected rules (returns 403):**
 *       - Cannot demote the last remaining SUPER_ADMIN
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Target user UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeRoleRequest'
 *           example:
 *             role: SUB_ADMIN
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       403:
 *         description: Last SUPER_ADMIN demotion protection
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch(
  '/:id/role',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  validate(userIdParamSchema, 'params'),
  validate(changeRoleSchema),
  userController.changeRole,
);

export { router as userRouter };
