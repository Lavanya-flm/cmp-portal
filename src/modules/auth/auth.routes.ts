import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../core/middleware/validate.middleware';
import { authenticate } from '../../core/middleware/auth.middleware';
import { authRateLimiter } from '../../core/middleware/rateLimiter.middleware';
import { loginSchema, refreshTokenSchema } from './auth.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication — login, token refresh, logout
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@cmp.io
 *         password:
 *           type: string
 *           format: password
 *           example: Admin@123456
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         email:
 *           type: string
 *           format: email
 *           example: admin@cmp.io
 *         firstName:
 *           type: string
 *           example: Admin
 *         lastName:
 *           type: string
 *           example: User
 *         role:
 *           type: string
 *           enum: [SUPER_ADMIN, SUB_ADMIN, USER]
 *           example: SUB_ADMIN
 *         isActive:
 *           type: boolean
 *           example: true
 *         isEmailVerified:
 *           type: boolean
 *           example: true
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: Login successful
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               description: JWT access token (short-lived, use in Authorization header)
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             refreshToken:
 *               type: string
 *               description: JWT refresh token (long-lived, use to rotate access token)
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             user:
 *               $ref: '#/components/schemas/AuthUser'
 *
 *     RefreshResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: Tokens refreshed successfully
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             refreshToken:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

// ─── Public routes (no auth required) ────────────────────────────────────────

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     description: |
 *       Authenticates a user and returns an access token + refresh token.
 *
 *       **How to use the token in Swagger:**
 *       1. Call this endpoint and copy the `accessToken` from the response.
 *       2. Click the **Authorize** button (🔒) at the top of this page.
 *       3. Paste the token into the **bearerAuth** field and click **Authorize**.
 *       4. All protected endpoints will now send the token automatically.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             subAdmin:
 *               summary: Sub-admin user
 *               value:
 *                 email: subadmin@cmp.io
 *                 password: SubAdmin@123456
 *             superAdmin:
 *               summary: Super admin
 *               value:
 *                 email: superadmin@cmp.io
 *                 password: SuperAdmin@123
 *     responses:
 *       200:
 *         description: Login successful — copy `data.accessToken` and use the Authorize button
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate tokens using a refresh token
 *     description: |
 *       Issues a new access + refresh token pair. The submitted refresh token is
 *       immediately invalidated (one-time use). Store the new refresh token for
 *       the next rotation.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: New token pair issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       401:
 *         description: Refresh token is invalid, expired, or already used
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/refresh', authRateLimiter, validate(refreshTokenSchema), authController.refresh);

// ─── Protected routes (valid access token required) ───────────────────────────

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns the user profile decoded from the access token.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthUser'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authenticate, authController.me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout from current device
 *     description: Revokes the current session and all refresh tokens for this user.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Revokes every active session and refresh token for the authenticated user.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout-all', authenticate, authController.logoutAll);

export { router as authRouter };
